import { cn } from "@/lib/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "./ui/button";

interface DragCardProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  title?: string;
  description?: string;
  onAddItem?: () => void;
}

const DragCard = ({
  id,
  children,
  title,
  description,
  onAddItem,
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
      }}
      className={cn(
        "w-full h-full p-4 bg-card rounded-xl flex flex-col gap-y-4",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-1">
          <h1 className="text-xl text-card-foreground">{title}</h1>
          <p className="text-muted-foreground text-sm">
            {description}
          </p>
        </div>
        <button
          className="border p-2 text-xs rounded-xl shadow-lg hover:shadow-xl"
          {...listeners}
        >
          Drag Handle
        </button>
      </div>

      {children}
      <Button variant="ghost" onClick={onAddItem}>
        Add Item
      </Button>
    </div>
  );
};

export default DragCard;
