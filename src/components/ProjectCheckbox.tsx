"use client";
import { FIND_PROJECT, UPDATE_PROJECT } from "@/app/constants";
import { Checkbox } from "./ui/checkbox";
import { useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Project } from "@/lib/types";

interface ProjectCheckboxProps {
  id: string;
}

const ProjectCheckbox = ({ id }: ProjectCheckboxProps) => {
  const [data, setData] = useState<Project>();
  const {
    loading,
    data: queryData,
    refetch,
  } = useQuery(FIND_PROJECT, {
    variables: { getTaskId: id },
    onError: (error) => {
      console.error("Error fetching task:", error);
    },
  });
  const [updateProject] = useMutation(UPDATE_PROJECT);
  useEffect(() => {
    if (!loading && queryData) {
      const task = queryData.getProject as Project;
      setData(task);
      if (!task) return;
    }
  }, [id, loading, queryData]);
  if (!data) return null;
  const handleCheckedChange = async () => {
    const newCompletedStatus =
      data?.status === "DONE" ? "TODO" : "DONE";
    try {
      await updateProject({
        variables: {
          input: {
            id: id,
            status: newCompletedStatus,
          },
        },
        optimisticResponse: {
          updateTask: {
            __typename: "Task",
            id: id,
            status: newCompletedStatus,
            name: data?.name,
            description: data?.description,
            deadline: data?.deadline,
          },
        },
      });
      setData((prev) =>
        prev ? { ...prev, status: newCompletedStatus } : undefined
      );
    } catch (error: any) {
      console.error("Error updating project:", error.message);
    }
  };
  return (
    <Checkbox
      checked={data?.status === "DONE"}
      onCheckedChange={handleCheckedChange}
    />
  );
};

export default ProjectCheckbox;
