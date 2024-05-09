"use client";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { useMutation, useQuery } from "@apollo/client";
import { DELETE_TASK, FETCH_TASKS } from "@/app/constants";
import { Task } from "@/lib/types";
import { useToast } from "./ui/use-toast";

interface TasksData {
  getAllTasks: Task[];
}

const DeleteCompleted = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<Task[]>([]);
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
        console.error(data.deleteTask.message);
      }
    },
  });
  const { loading, data: queryData } = useQuery(FETCH_TASKS);
  const { toast } = useToast();
  useEffect(() => {
    if (!loading && queryData) {
      const tasks = queryData.getAllTasks as Task[];
      setData(tasks);
    }
  }, [loading, queryData]);
  const deleteCompletedTasks = async () => {
    const completedTasks = data.filter(
      (task) => task.status === "DONE"
    );
    for (const task of completedTasks) {
      try {
        await deleteTask({ variables: { id: task.id } });
      } catch (error) {
        console.error("Failed to delete task", error);
        toast({
          title: "Error",
          description: `Failed to delete task: ${task.title}`,
        });
        break;
      }
    }
    setIsOpen(false);
    toast({
      title: "Deletion Complete",
      description: "All completed tasks have been deleted.",
    });
  };
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="rounded-lg ring-destructive border border-destructive px-4 py-2 text-muted-foreground hover:text-destructive-foreground hover:bg-destructive">
        Delete Completed
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          Are you sure you want to delete all completed tasks?
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4 items-center mt-8 mb-4 mr-4">
          <Button
            onClick={() => setIsOpen(false)}
            variant={"outline"}
          >
            Cancel
          </Button>
          <Button
            onClick={deleteCompletedTasks}
            variant={"destructive"}
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCompleted;
