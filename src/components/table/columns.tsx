import { Project, Task } from "@/lib/types";
import { capitalize, isTask } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";
import EditTask from "../TaskEdit";
import EditProject from "../ProjectEdit";
import TaskCheckbox from "../TaskCheckbox";
import ProjectCheckbox from "../ProjectCheckbox";
import {
  CalendarIcon,
  Circle,
  CircleCheckBig,
  Flag,
  X,
  Plus,
} from "lucide-react";

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

const priorityIcons = {
  LOW: <Flag size={16} color="#808080" fill="#808080" />,
  MEDIUM: <Flag size={16} color="#FFFF00" fill="#FFFF00" />,
  HIGH: <Flag size={16} color="#FF0000" fill="#FF0000" />,
};

enum Status {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

const statusIcons = {
  TODO: <Circle size={16} />,
  IN_PROGRESS: <Circle size={16} color="#FFAE42" fill="#FFAE42" />,
  DONE: <CircleCheckBig color="#00FF00" size={16} />,
};

const editWrapper = (
  element: Task | Project,
  children: React.ReactNode
) => {
  return isTask(element) ? (
    <EditTask id={element.id}>{children}</EditTask>
  ) : (
    <EditProject id={element.id}>{children}</EditProject>
  );
};

export const columns: ColumnDef<Task | Project>[] = [
  {
    accessorKey: "checkbox",
    header: () => <div className="sr-only">Checkbox</div>,
    cell: ({ row }) =>
      editWrapper(
        row.original,
        isTask(row.original) ? (
          <TaskCheckbox id={row.original.id} />
        ) : (
          <ProjectCheckbox id={row.original.id} />
        )
      ),
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
    cell: ({ row }) =>
      editWrapper(
        row.original,
        <span className="flex-1 text-ellipsis overflow-hidden whitespace-nowrap">
          {isTask(row.original)
            ? row.original.title
            : row.original.name}
        </span>
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
    cell: ({ row, getValue }) =>
      editWrapper(
        row.original,
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
    cell: ({ row, getValue }) =>
      editWrapper(
        row.original,
        <div className="text-left ml-4 font-medium flex items-center gap-2">
          {priorityIcons[getValue() as Priority]}
          {capitalize(getValue() as string)}
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
    cell: ({ row, getValue }) =>
      editWrapper(
        row.original,
        getValue() ? (
          <div className="text-left ml-4 font-medium">
            {new Date(getValue() as string).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </div>
        ) : (
          <div className="text-left ml-4 font-medium">
            No deadline
          </div>
        )
      ),
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
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    cell: ({ row, getValue }) =>
      editWrapper(
        row.original,
        <div className="text-left ml-4 flex items-center gap-2">
          {statusIcons[getValue() as Status]}
          {(() => {
            switch (getValue() as string) {
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
    cell: ({ row, getValue }) =>
      editWrapper(
        row.original,
        <div className="text-left ml-4">
          {getValue() as React.ReactNode}
        </div>
      ),
  },
];
