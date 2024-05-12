"use client";
import { useMutation, useQuery } from "@apollo/client";
import TaskForm from "./TaskForm";
import {
  DELETE_TASK,
  FETCH_TASKS,
  FIND_TASK,
  UPDATE_TASK,
} from "@/app/constants";
import { useEffect, useState } from "react";
import { Task, formSchema } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "./ui/use-toast";
import { Dialog, DialogTrigger } from "./ui/dialog";
import { useMediaQuery } from "react-responsive";
import { Drawer, DrawerTrigger } from "./ui/drawer";

interface TaskEditProps {
  id: string;
  children: React.ReactNode;
}
interface TasksData {
  getAllTasks: Task[];
}

const TaskEdit = ({ id, children }: TaskEditProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Task>();
  const [categories, setCategories] = useState<string[]>([]);
  const {
    loading,
    data: queryData,
    refetch,
  } = useQuery(FIND_TASK, {
    variables: { getTaskId: id },
    onError: (error) => {
      console.error("Error fetching task:", error);
    },
  });
  const { loading: loading2, data: queryData2 } =
    useQuery(FETCH_TASKS);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: data?.title || "",
      description: data?.description || "",
      deadline: data?.deadline ? new Date(data.deadline) : null,
      priority: data?.priority || "LOW",
      category: data?.category || "",
      status: data?.status || "TODO",
    },
  });
  const { toast } = useToast();
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK, {
    update: (cache, { data }) => {
      if (data.deleteTask.success) {
        const deletedTaskId = data.deleteTask.id;

        const existingTasks = cache.readQuery<TasksData>({
          query: FETCH_TASKS,
        });
        if (existingTasks) {
          const updatedTasks = existingTasks.getAllTasks.filter(
            (task) => task.id !== deletedTaskId
          );

          cache.writeQuery<TasksData>({
            query: FETCH_TASKS,
            data: { getAllTasks: updatedTasks },
          });
        }
      } else {
        // Log or handle the unsuccessful deletion message
        console.error(data.deleteTask.message);
      }
    },
  });
  useEffect(() => {
    if (!loading && queryData) {
      const task = queryData.getTask as Task;
      setData(task);
      if (!task) return;
      form.reset({
        title: task.title,
        description: task.description,
        deadline: task.deadline ? new Date(task.deadline) : null,
        priority: task.priority,
        category: task.category,
        status: task.status,
      });
    }
    if (!loading2 && queryData2) {
      const tasks = queryData2.getAllTasks as Task[];
      const categoryNames = Array.from(
        new Set(
          tasks
            .map((entry) => entry.category)
            .filter((category): category is string => !!category)
        )
      );
      setCategories(categoryNames);
    }
  }, [form, id, loading, loading2, queryData, queryData2]);
  const isDesktop = useMediaQuery({ minWidth: 768 });

  if (loading || loading2) return null;

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
      await updateTask({
        variables: {
          input: {
            title,
            description,
            deadline,
            priority,
            category,
            status,
            id,
          },
        },
      });
      refetch({ getTaskId: id });
      setIsOpen(false);
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
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
      const response = await deleteTask({ variables: { id: id } });
      if (response.data.deleteTask.success) {
        toast({
          title: "Task deleted",
          description: "The task has been deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Task could not be deleted",
        });
      }
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };
  if (isDesktop)
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger className="w-full h-full flex items-center justify-start text-left p-2 cursor-pointer overflow-hidden focus:border-none active:border-none focus:outline-none border-none outline-none focus-visible:ring-transparent">
          {children}
        </DialogTrigger>
        <TaskForm
          categories={categories}
          form={form}
          setIsOpen={setIsOpen}
          onSubmit={onSubmit}
          type="edit"
          onDelete={onDelete}
        />
      </Dialog>
    );
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger>{children}</DrawerTrigger>
      <TaskForm
        categories={categories}
        form={form}
        setIsOpen={setIsOpen}
        onSubmit={onSubmit}
        type="edit"
        onDelete={onDelete}
      />
    </Drawer>
  );
};

export default TaskEdit;
