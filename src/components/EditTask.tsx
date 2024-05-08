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

interface EditTaskProps {
  id: string;
  children: React.ReactNode;
}
interface TasksData {
  getAllTasks: Task[];
}

const EditTask = ({ id, children }: EditTaskProps) => {
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
      completed: data?.completed || false,
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
        completed: task.completed,
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
  if (loading || loading2) return null;

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
      await updateTask({
        variables: {
          input: {
            title,
            description,
            deadline,
            priority,
            category,
            completed,
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
    console.log("Attempting to delete the task");
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
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-full h-full flex items-center justify-start text-left p-2 cursor-pointer overflow-hidden">
        {children}
      </DialogTrigger>

      <TaskForm
        categories={categories}
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

export default EditTask;
