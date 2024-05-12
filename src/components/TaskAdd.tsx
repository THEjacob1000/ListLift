"use client";

import { Dialog, DialogTrigger } from "./ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_TASK, FETCH_TASKS } from "@/app/constants";
import { useToast } from "./ui/use-toast";
import TaskForm from "./TaskForm";
import { cn } from "@/lib/utils";
import { Task, formSchema } from "@/lib/types";
import { useMediaQuery } from "react-responsive";
import { Drawer, DrawerTrigger } from "./ui/drawer";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";

interface TaskAddProps {
  categories: string[];
  className?: string;
}
interface TasksData {
  getAllTasks: Task[];
}

const TaskAdd = ({ categories = [], className }: TaskAddProps) => {
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
      status: "TODO",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const {
      title,
      description,
      deadline,
      priority,
      category,
      status,
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
            status,
          },
        },
        update: (cache, { data }) => {
          const existingTasks = cache.readQuery<TasksData>({
            query: FETCH_TASKS,
          });
          if (existingTasks && data.createTask) {
            cache.writeQuery<TasksData>({
              query: FETCH_TASKS,
              data: {
                getAllTasks: [
                  ...existingTasks.getAllTasks,
                  data.createTask,
                ],
              },
            });
          }
        },
      });
      form.reset();
      setIsOpen(false);
      toast({
        title: "Task created",
        description: "The task has been created successfully",
      });
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };

  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (isDesktop)
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger
          className={cn(
            "ml-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4",
            className
          )}
        >
          Add Task
        </DialogTrigger>
        <TaskForm
          form={form}
          categories={categories}
          onSubmit={onSubmit}
          setIsOpen={setIsOpen}
          type={"new"}
        />
      </Dialog>
    );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="fixed right-10 rounded-full px-4 py-7 bottom-28">
          <Plus size={24} />
        </Button>
      </DrawerTrigger>
      <TaskForm
        form={form}
        categories={categories}
        onSubmit={onSubmit}
        setIsOpen={setIsOpen}
        type={"new"}
      />
    </Drawer>
  );
};

export default TaskAdd;
