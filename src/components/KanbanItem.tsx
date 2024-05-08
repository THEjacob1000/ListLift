import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import React from "react";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import { cn } from "@/lib/utils";

interface KanbanItemProps {
  id: UniqueIdentifier;
  title: string;
}

const KanbanItem = ({ id, title }: KanbanItemProps) => {
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
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
      }}
      className={cn(
        "px-2 py-4 bg-accent shadow-md rounded-xl w-full border border-transparent hover:border-border cursor-pointer",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        {title}
        <button
          className="border bg-card p-2 text-xs rounded-xl shadow-lg hover:shadow-xl"
          {...listeners}
        >
          Drag Handle
        </button>
      </div>
    </div>
  );
};

export default KanbanItem;
