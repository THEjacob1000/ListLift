import { Task, formSchema } from "@/lib/types";
import { Drawer, DrawerTrigger } from "./ui/drawer";
import { Circle, CircleCheckBig } from "lucide-react";
import {
  FIND_TASK,
  FETCH_TASKS,
  UPDATE_TASK,
  DELETE_TASK,
} from "@/app/constants";
import { useQuery, useMutation } from "@apollo/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "./ui/use-toast";
import TaskForm from "./TaskForm";

interface MobileTaskItemProps {
  task: Task;
}

interface TasksData {
  getAllTasks: Task[];
}

const MobileTaskItem = ({ task }: MobileTaskItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Task>();
  const [categories, setCategories] = useState<string[]>([]);
  const {
    loading,
    data: queryData,
    refetch,
  } = useQuery(FIND_TASK, {
    variables: { getTaskId: task.id },
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
  }, [form, loading, loading2, queryData, queryData2]);
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
            id: task.id,
          },
        },
      });
      refetch({ getTaskId: task.id });
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
      const response = await deleteTask({
        variables: { id: task.id },
      });
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
  const statusIcons = {
    TODO: <Circle size={16} />,
    IN_PROGRESS: <Circle size={16} color="#FFAE42" fill="#FFAE42" />,
    DONE: <CircleCheckBig color="#00FF00" size={16} />,
  };
  return (
    <Drawer key={task.id}>
      <DrawerTrigger className="flex gap-2 bg-secondary p-4 rounded-lg w-full flex-col items-start justify-center">
        <div>
          <div className="flex w-full justify-start gap-2 items-center">
            {statusIcons[task.status as keyof typeof statusIcons]}
            <div>{task.title}</div>
          </div>
        </div>
        <div className="text-muted-foreground">{task.category}</div>
      </DrawerTrigger>
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

export default MobileTaskItem;
