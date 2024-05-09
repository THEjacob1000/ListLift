"use client";
import { useMutation, useQuery } from "@apollo/client";
import ProjectForm from "./ProjectForm";
import {
  DELETE_PROJECT,
  FETCH_PROJECTS,
  FIND_PROJECT,
  UPDATE_PROJECT,
} from "@/app/constants";
import { useEffect, useState } from "react";
import { Task, Project, projectSchema } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "./ui/use-toast";
import { Dialog, DialogTrigger } from "./ui/dialog";

interface EditProjectProps {
  id: string;
  children: React.ReactNode;
}
interface ProjectsData {
  getAllProjects: Project[];
}

const EditProject = ({ id, children }: EditProjectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Project>();
  const [subTasks, setSubTasks] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const {
    loading,
    data: queryData,
    refetch,
  } = useQuery(FIND_PROJECT, {
    variables: { getProjectId: id },
    onError: (error) => {
      console.error("Error fetching project:", error);
    },
  });

  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: data?.name || "",
      description: data?.description || "",
      deadline: data?.deadline ? new Date(data.deadline) : null,
      status: data?.status || "TODO",
      tasks: subTasks,
    },
  });
  const { toast } = useToast();
  const [updateProject] = useMutation(UPDATE_PROJECT);
  const [deleteProject] = useMutation(DELETE_PROJECT, {
    update: (cache, { data }) => {
      if (data.deleteProject.success) {
        const deletedProjectId = data.deleteProject.id;

        const existingProjects = cache.readQuery<ProjectsData>({
          query: FETCH_PROJECTS,
        });
        if (existingProjects) {
          const updatedProjects =
            existingProjects.getAllProjects.filter(
              (project) => project.id !== deletedProjectId
            );

          cache.writeQuery<ProjectsData>({
            query: FETCH_PROJECTS,
            data: { getAllProjects: updatedProjects },
          });
        }
      } else {
        // Log or handle the unsuccessful deletion message
        console.error(data.deleteProject.message);
      }
    },
  });
  useEffect(() => {
    if (!loading && queryData) {
      const project = queryData.getProject as Project;
      setData(project);
      if (!project) return;
      form.reset({
        name: project.name,
        description: project.description,
        deadline: project.deadline
          ? new Date(project.deadline)
          : null,
        status: project.status,
      });
      setSubTasks(project.tasks.map((task: Task) => task.id));
    }
  }, [form, id, loading, queryData]);
  if (loading) return null;

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    const { name, description, deadline, status } = values || {};
    try {
      await updateProject({
        variables: {
          input: {
            description,
            deadline,
            status,
            id,
          },
        },
      });
      refetch({ getProjectId: id });
      setIsOpen(false);
      toast({
        title: "Project updated",
        description: "The project has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };

  const onDelete = async () => {
    try {
      const response = await deleteProject({ variables: { id: id } });
      if (response.data.deleteProject.success) {
        toast({
          title: "Project deleted",
          description: "The project has been deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Project could not be deleted",
        });
      }
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-full h-full flex items-center justify-start text-left p-2 cursor-pointer overflow-hidden focus:border-none active:border-none focus:outline-none border-none outline-none focus-visible:ring-transparent">
        {children}
      </DialogTrigger>
      <ProjectForm
        form={form}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        onSubmit={onSubmit}
        type="edit"
        onDelete={onDelete}
      />
    </Dialog>
  );
};

export default EditProject;
