import { cn } from "@/lib/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";
import React from "react";
import KanbanItem from "./KanbanItem";
import Heading from "./Heading";

interface DragCardProps {
  id: UniqueIdentifier;
  title?: string;
  description?: string;
  isEmpty?: boolean;
  items: {
    id: UniqueIdentifier;
    title: string;
  }[];
}

const DragCard = ({
  id,
  title,
  description,
  isEmpty,
  items,
}: DragCardProps) => {
  const {
    attributes,
    setNodeRef,
    listeners,
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
      <SortableContext items={items.map((item) => item.id)}>
        {items.length > 0 ? (
          items.map((item) => (
            <KanbanItem key={item.id} id={item.id} />
          ))
        ) : (
          <div className="text-muted-foreground text-center border-border border p-2 rounded-xl">
            Drop items here
          </div>
        )}
      </SortableContext>
    </div>
  );
};

export default DragCard;
