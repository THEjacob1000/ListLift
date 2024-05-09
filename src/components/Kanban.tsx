"use client";

import { DNDType, Task } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Boxes, Container } from "lucide-react";
import { capitalize } from "@/lib/utils";
import AddTask from "./AddTask";
import DeleteCompleted from "./DeleteCompleted";
import { FETCH_TASKS, FIND_TASK } from "@/app/constants";
import { useQuery } from "@apollo/client";
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCenter,
  closestCorners,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import DragCard from "./DragCard";
import KanbanItem from "./KanbanItem";
import { useMutation } from "@apollo/client";
import { UPDATE_TASK } from "@/app/constants";
import {
  findItemTitle,
  handleDragEnd,
  handleDragMove,
  handleDragStart,
} from "@/lib/dnd-funcs";

interface GroupedTasks {
  [key: string]: Task[];
}

const Kanban = () => {
  const [data, setData] = useState<Task[]>([]);
  const [grouping, setGrouping] = useState<string>("priority");
  const [filter, setFilter] = useState("");
  const [containers, setContainers] = useState<DNDType[]>([]);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(
    null
  );
  const [idToTitleMap, setIdToTitleMap] = useState<{
    [key: string]: string;
  }>({});
  const [currentContainerId, setCurrentContainerId] =
    useState<UniqueIdentifier | null>(null);
  const [containerName, setContainerName] = useState<string>("");
  const [itemName, setItemName] = useState<string>("");
  const [showAddContainerModal, setShowAddContainerModal] =
    useState<boolean>(false);
  const [showAddItemModal, setShowAddItemModal] =
    useState<boolean>(false);
  const [updateTask] = useMutation(UPDATE_TASK);

  const groupOptions = [
    { id: "category", name: "Category" },
    { id: "priority", name: "Priority" },
    { id: "status", name: "Status" },
  ];
  const { loading, data: queryData } = useQuery(FETCH_TASKS);
  useEffect(() => {
    if (!loading && queryData) {
      const tasks = queryData.getAllTasks as Task[];
      setData(tasks);
    }
  }, [loading, queryData]);
  const categoryNames = Array.from(
    new Set(
      data
        .map((entry) => entry.category)
        .filter((category): category is string => !!category)
    )
  );
  const groupedData: GroupedTasks = useMemo(() => {
    const filteredData = data.filter((task) =>
      task.title.toLowerCase().includes(filter.toLowerCase())
    );

    if (!grouping) {
      return { "All Tasks": filteredData };
    }

    let intermediateGroupedTasks = filteredData.reduce(
      (acc: GroupedTasks, task: Task) => {
        let groupKey =
          task[grouping] === undefined ? "Other" : task[grouping];

        if (grouping === "priority") {
          switch (groupKey) {
            case "LOW":
              groupKey = "Low";
              break;
            case "MEDIUM":
              groupKey = "Medium";
              break;
            case "HIGH":
              groupKey = "High";
              break;
            default:
              groupKey = "Low";
          }
        } else if (grouping === "status") {
          switch (groupKey) {
            case "TODO":
              groupKey = "To Do";
              break;
            case "IN_PROGRESS":
              groupKey = "In Progress";
              break;
            case "DONE":
              groupKey = "Completed";
              break;
            default:
              groupKey = "Todo";
          }
        } else if (typeof groupKey !== "string") {
          groupKey = String(groupKey);
        }

        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(task);
        return acc;
      },
      {}
    );
    if (grouping === "priority") {
      const groupOrder = ["Low", "Medium", "High"];
      const sortedGroupedTasks: { [key: string]: Task[] } = {};
      groupOrder.forEach((key) => {
        if (intermediateGroupedTasks[key]) {
          sortedGroupedTasks[key] =
            intermediateGroupedTasks[key] || [];
        }
      });

      return sortedGroupedTasks;
    } else if (grouping === "status") {
      const groupOrder = ["To Do", "In Progress", "Completed"];
      const sortedGroupedTasks: { [key: string]: Task[] } = {};
      groupOrder.forEach((key) => {
        if (intermediateGroupedTasks[key]) {
          sortedGroupedTasks[key] =
            intermediateGroupedTasks[key] || [];
        }
      });
      return sortedGroupedTasks;
    }
    return intermediateGroupedTasks;
  }, [data, grouping, filter]);

  useEffect(() => {
    const defaultGroups: { [key: string]: Task[] } = {};
    if (grouping === "priority") {
      defaultGroups["Low"] = [];
      defaultGroups["Medium"] = [];
      defaultGroups["High"] = [];
    } else if (grouping === "status") {
      defaultGroups["To Do"] = [];
      defaultGroups["In Progress"] = [];
      defaultGroups["Completed"] = [];
    }

    const mergedGroupedTasks: { [key: string]: Task[] } = {
      ...defaultGroups,
    };
    Object.keys(groupedData).forEach((key) => {
      mergedGroupedTasks[key] = groupedData[key];
    });

    const newContainers = Object.entries(mergedGroupedTasks).map(
      ([groupName, tasks]) => ({
        id: groupName,
        title: groupName,
        items: tasks, // Directly using the array of Task objects
      })
    );
    setContainers(newContainers);
  }, [groupedData, grouping]);

  useEffect(() => {
    const newIdToTitleMap: { [key: string]: string } = {};
    containers.forEach((container) => {
      newIdToTitleMap[container.id as string] = container.title;
    });
    setIdToTitleMap(newIdToTitleMap);
  }, [containers]);
  const currentGroupName =
    groupOptions.find((opt) => opt.id === grouping)?.name || "None";

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 50, tolerance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="mt-6">
      <div className="flex items-center w-full justify-between py-4">
        <div className="inline-flex gap-2">
          <Input
            placeholder="Filter tasks..."
            className="max-w-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="ml-auto">
                <Boxes size={16} className="mr-2" />
                Group By: {capitalize(currentGroupName)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup
                value={grouping}
                onValueChange={(value) => {
                  setGrouping(value || "Priority");
                }}
              >
                {groupOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.id}
                    value={option.id}
                    className="pr-20"
                  >
                    {option.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex gap-2">
          <DeleteCompleted />
          <AddTask categories={categoryNames} />
        </div>
      </div>
      <div className="mt-4">
        <div className="grid grid-cols-3 gap-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event: DragStartEvent) =>
              handleDragStart(event, setActiveId)
            }
            onDragMove={(event: DragMoveEvent) =>
              handleDragMove(event, containers, setContainers)
            }
            onDragEnd={(event: DragEndEvent) => {
              handleDragEnd(
                event,
                containers,
                setContainers,
                groupedData,
                grouping,
                updateTask,
                setActiveId
              );
            }}
          >
            <SortableContext
              items={containers.map((container) => container.id)}
            >
              {containers.map((container) => (
                <DragCard
                  id={container.id}
                  title={container.title}
                  key={container.id}
                  isEmpty={container.items.length === 0}
                  items={container.items}
                />
              ))}
            </SortableContext>
            <DragOverlay>
              {activeId ? <KanbanItem id={activeId} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default Kanban;
