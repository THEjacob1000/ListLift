"use client";

import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import React, { useEffect, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { cn } from "@/lib/utils";
import { useQuery } from "@apollo/client";
import { FIND_TASK } from "@/app/constants";
import { Task } from "@/lib/types";
import { Card } from "./ui/card";
import { Flag, FolderDot } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import EditTask from "./EditTask";
import { format } from "date-fns";

interface KanbanItemProps {
  id: UniqueIdentifier;
}
enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

const KanbanItem = ({ id }: KanbanItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "item",
    },
  });
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

  useEffect(() => {
    // Refetch the data every 5 seconds
    const intervalId = setInterval(() => {
      refetch();
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, [refetch]);

  useEffect(() => {
    if (!loading && queryData) {
      const task = queryData.getTask as Task;
      setData(task);
    }
  }, [loading, queryData]);
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.LOW:
        return "#808080";
      case Priority.MEDIUM:
        return "#FFFF00";
      case Priority.HIGH:
        return "#FF0000";
      default:
        return "#000000";
    }
  };
  if (!data) return null;
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
    >
      <EditTask id={id as string}>
        <Card
          className={cn(
            isDragging ? "opacity-50" : "",
            "hover:border-border cursor-pointer bg-secondary flex flex-col rounded-sm bg-slate-950 items-center w-full mx-4"
          )}
          {...listeners}
        >
          <div className="bg-slate-950 text-muted-foreground text-sm m-0 flex gap-1 items-center">
            <FolderDot size={12} />
            {data.category || "No Category"}
          </div>
          <div className="bg-secondary h-full flex flex-col items-start w-full justify-center px-8">
            <div className="flex justify-start gap-4 items-center w-full my-4">
              <Flag
                color={getPriorityColor(data.priority as Priority)}
                size={16}
                fill={getPriorityColor(data.priority as Priority)}
              />
              {data.completed}
            </div>
            <h1 className="text-lg text-card-foreground">
              {data.title}
            </h1>
            <p className="my-4 text-muted-foreground">
              {data.deadline
                ? format(data.deadline, "EEEE do MMM")
                : "No Deadline"}
            </p>
          </div>
        </Card>
      </EditTask>
    </div>
  );
};

export default KanbanItem;
