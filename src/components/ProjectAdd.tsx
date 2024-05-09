"use client";

import { Dialog, DialogTrigger } from "./ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_PROJECT, FETCH_PROJECTS } from "@/app/constants";
import { useToast } from "./ui/use-toast";
import ProjectForm from "./ProjectForm";
import { Project, projectSchema } from "@/lib/types";

interface ProjectsData {
  getAllProjects: Project[];
}

const AddProject = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [createProject] = useMutation(CREATE_PROJECT);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      deadline: null as Date | null,
      status: "TODO",
      tasks: [""],
    },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    const { name, description, deadline, status } = values || {};
    try {
      await createProject({
        variables: {
          input: {
            name,
            description,
            deadline,
            status,
          },
        },
        update: (cache, { data }) => {
          const existingProjects = cache.readQuery<ProjectsData>({
            query: FETCH_PROJECTS,
          });
          if (existingProjects && data.createProject) {
            cache.writeQuery<ProjectsData>({
              query: FETCH_PROJECTS,
              data: {
                getAllProjects: [
                  ...existingProjects.getAllProjects,
                  data.createProject,
                ],
              },
            });
          }
        },
      });
      form.reset();
      setIsOpen(false);
      toast({
        title: "Project created",
        description: "The Project has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="ml-2 bg-secondary text-secondary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4">
        Add Project
      </DialogTrigger>
      <ProjectForm
        form={form}
        onSubmit={onSubmit}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        type={"new"}
      />
    </Dialog>
  );
};

export default AddProject;
