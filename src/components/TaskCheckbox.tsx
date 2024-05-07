"use client";
import { FIND_TASK, UPDATE_TASK } from "@/app/constants";
import { Checkbox } from "./ui/checkbox";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Task } from "@/lib/types";

interface TaskCheckboxProps {
  id: string;
}

const TaskCheckbox = ({ id }: TaskCheckboxProps) => {
  const [data, setData] = useState<Task>();
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
  const [updateTask] = useMutation(UPDATE_TASK);
  useEffect(() => {
    if (!loading && queryData) {
      const task = queryData.getTask as Task;
      setData(task);
      if (!task) return;
    }
  }, [id, loading, queryData]);
  if (!data) return null;
  const handleCheckedChange = async () => {
    const newCompletedStatus = !data?.completed;
    try {
      await updateTask({
        variables: {
          input: {
            id: id,
            completed: newCompletedStatus,
          },
        },
        optimisticResponse: {
          updateTask: {
            __typename: "Task",
            id: id,
            completed: newCompletedStatus,
            title: data?.title,
            description: data?.description,
            priority: data?.priority,
            deadline: data?.deadline,
            category: data?.category,
          },
        },
      });
      setData((prev) =>
        prev ? { ...prev, completed: newCompletedStatus } : undefined
      );
    } catch (error: any) {
      console.error("Error updating task:", error.message);
    }
  };
  return (
    <Checkbox
      checked={data?.completed}
      onCheckedChange={handleCheckedChange}
    />
  );
};

export default TaskCheckbox;
