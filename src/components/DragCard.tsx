import { cn } from "@/lib/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import React from "react";
import KanbanItem from "./KanbanItem";
import Heading from "./Heading";
import { Task } from "@/lib/types";

interface DragCardProps {
  id: UniqueIdentifier;
  title?: string;
  isEmpty?: boolean;
  items: Task[];
}

const DragCard = ({ id, title, isEmpty, items }: DragCardProps) => {
  const {
    attributes,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "container",
    },
  });

  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
        minHeight: isEmpty ? "100px" : undefined,
      }}
      className={cn(
        "w-full h-full p-4 bg-card rounded-xl flex flex-col gap-y-4 border-border-1 border",
        isDragging && "opacity-50"
      )}
    >
      <Heading as="h4" size="sm" className="mx-6">
        {title}
      </Heading>

      {items.length > 0 ? (
        items.map((item) => <KanbanItem key={item.id} id={item.id} />)
      ) : (
        <div className="text-muted-foreground text-center border-border border p-2 rounded-xl">
          Drop items here
        </div>
      )}
    </div>
  );
};

export default DragCard;
