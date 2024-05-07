"use client";

import { Dialog, DialogTrigger } from "./ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_TASK } from "@/app/constants";
import { useToast } from "./ui/use-toast";
import TaskForm from "./TaskForm";
import { formSchema } from "@/lib/types";

interface AddTaskProps {
  categories: string[];
}

const AddTask = ({ categories = [] }: AddTaskProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [createTask] = useMutation(CREATE_TASK);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: null as Date | null,
      priority: "LOW",
      category: "",
      completed: false,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form Submitted:", values);
    const {
      title,
      description,
      deadline,
      priority,
      category,
      completed,
    } = values || {};
    try {
      await createTask({
        variables: {
          input: {
            title,
            description,
            deadline,
            priority,
            category,
            completed,
          },
        },
      });
      form.reset();
      setIsOpen(false);
      toast({
        title: "Task created",
        description: "The task has been created successfully",
        status: "success",
      });
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
        status: "error",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4">
        Add Task
      </DialogTrigger>
      <TaskForm
        form={form}
        categories={categories}
        onSubmit={onSubmit}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    </Dialog>
  );
};

export default AddTask;
