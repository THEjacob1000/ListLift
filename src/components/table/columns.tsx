import { Task } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import EditTask from "../EditTask";
import TaskCheckbox from "../TaskCheckbox";

export const columns: ColumnDef<Task>[] = [
  {
    accessorKey: "checkbox",
    header: () => <div className="sr-only">Checkbox</div>,
    cell: ({ row }) => <TaskCheckbox id={row.original.id} />,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Title
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-left ml-4">
        <EditTask id={row.original.id}>
          <span className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
            {row.original.title || "No Title"}
          </span>
        </EditTask>
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Description
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="text-left ml-4">
        {getValue() as React.ReactNode}
      </div>
    ),
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Priority
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="text-left ml-4 font-medium">
        {getValue() as React.ReactNode}
      </div>
    ),
  },
  {
    accessorKey: "deadline",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Deadline
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => {
      if (!getValue()) return null;
      const deadline = new Date(getValue() as string);
      const formatted = deadline.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      return (
        <div className="text-left ml-4 font-medium">{formatted}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="text-left ml-4">
        {(() => {
          switch (getValue() as React.ReactNode) {
            case "TODO":
              return "To Do";
            case "IN_PROGRESS":
              return "In Progress";
            case "DONE":
              return "Completed";
            default:
              return "";
          }
        })()}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() =>
          column.toggleSorting(column.getIsSorted() === "asc")
        }
      >
        Category
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ getValue }) => (
      <div className="text-left ml-4">
        {getValue() as React.ReactNode}
      </div>
    ),
  },
];
