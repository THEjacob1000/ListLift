"use client";

import { Task } from "@/lib/types";
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
  closestCorners,
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

interface GroupedTasks {
  [key: string]: Task[];
}

type DNDType = {
  id: UniqueIdentifier;
  title: string;
  items: {
    id: UniqueIdentifier;
    title: string;
  }[];
};

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
    { id: "completed", name: "Status" },
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

    const groupOrder = ["Low", "Medium", "High"]; // Define custom order, including 'Other'
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
        } else if (
          grouping === "completed" &&
          typeof groupKey === "boolean"
        ) {
          groupKey = groupKey ? "Completed" : "Not Completed";
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

    // Sort keys according to the defined order
    const sortedGroupedTasks: { [key: string]: Task[] } = {};
    groupOrder.forEach((key) => {
      if (intermediateGroupedTasks[key]) {
        sortedGroupedTasks[key] = intermediateGroupedTasks[key];
      }
    });

    return sortedGroupedTasks;
  }, [data, grouping, filter]);

  useEffect(() => {
    const newContainers = Object.entries(groupedData).map(
      ([groupName, tasks]) => ({
        id: groupName,
        title: groupName,
        items: tasks.map((task) => ({
          id: task.id,
          title: task.title,
        })),
      })
    );
    setContainers(newContainers);
  }, [groupedData]);

  useEffect(() => {
    const newIdToTitleMap: { [key: string]: string } = {};
    containers.forEach((container) => {
      newIdToTitleMap[container.id as string] = container.title;
    });
    setIdToTitleMap(newIdToTitleMap);
  }, [containers]);
  const currentGroupName =
    groupOptions.find((opt) => opt.id === grouping)?.name || "None";

  // Find the value of the items
  function findValueOfItems(
    id: UniqueIdentifier | undefined,
    type: string
  ) {
    if (type === "container") {
      return containers.find((item) => item.id === id);
    }
    if (type === "item") {
      return containers.find((container) =>
        container.items.find((item) => item.id === id)
      );
    }
  }

  const findItemTitle = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, "item");
    if (!container) return "";
    const item = container.items.find((item) => item.id === id);
    if (!item) return "";
    return item.title;
  };

  const findContainerTitle = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, "container");
    if (!container) return "";
    return container.title;
  };

  const findContainerItems = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, "container");
    if (!container) return [];
    return container.items;
  };
  const findContainerFromItem = (itemId: string) => {
    let containerTitle = null;
    Object.entries(groupedData).forEach(([groupName, tasks]) => {
      if (tasks.some((task) => task.id === itemId)) {
        containerTitle = groupName;
      }
    });
    return containerTitle;
  };

  // DND Logic
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    setActiveId(id);
  };
  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;
    // Handle Item sorting
    if (
      active.id.toString().includes("item") &&
      over?.id.toString().includes("item") &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find Active Container
      const activeContainer = findValueOfItems(active.id, "item");
      const overContainer = findValueOfItems(over.id, "item");
      if (!activeContainer || !overContainer) return;

      // Find Active or Over Container Index
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id
      );

      // Find Active or Over Item Index
      const activeItemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id
      );
      const overItemIndex = overContainer.items.findIndex(
        (item) => item.id === over.id
      );

      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        let newItems = [...containers];
        newItems[activeContainerIndex].items = arrayMove(
          activeContainer.items,
          activeItemIndex,
          overItemIndex
        );
        setContainers(newItems);
      } else {
        // In different container
        let newItems = [...containers];
        const [removedItem] = newItems[
          activeContainerIndex
        ].items.splice(activeItemIndex, 1);
        newItems[overContainerIndex].items.splice(
          overItemIndex,
          0,
          removedItem
        );
        setContainers(newItems);
      }
    }

    // Handle Item Drop Into Container
    if (
      active.id.toString().includes("item") &&
      over?.id.toString().includes("container") &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, "item");
      const overContainer = findValueOfItems(over.id, "container");

      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return;

      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id
      );

      // Find the index of the active item in the active container
      const activeItemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id
      );

      // Remove the active item from the active container and add it to the over container
      let newItems = [...containers];
      const [removedItem] = newItems[
        activeContainerIndex
      ].items.splice(activeItemIndex, 1);
      newItems[overContainerIndex].items.push(removedItem);
      setContainers(newItems);
    }
  };
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Handling the movement of containers themselves
    if (
      active.id.toString().includes("container") &&
      over.id.toString().includes("container")
    ) {
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === active.id
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === over.id
      );
      if (activeContainerIndex !== -1 && overContainerIndex !== -1) {
        let newContainers = arrayMove(
          containers,
          activeContainerIndex,
          overContainerIndex
        );
        setContainers(newContainers);
      }
      return; // Early return to avoid executing item drop logic below
    }
    // Handling dropping items into containers or reordering within the same container
    const activeContainer = findValueOfItems(active.id, "item");
    const overContainer = findValueOfItems(over.id, "item");

    if (!activeContainer || !overContainer) return;
    const activeItem = activeContainer.items.find(
      (item) => item.id === active.id
    );
    const overContainerTitle = findContainerFromItem(
      over.id as string
    );
    if (!activeItem) {
      console.error("Dragged item not found");
      return;
    }
    // Prepare the properties to be updated based on the grouping context
    let updatedProperties: {
      category?: string;
      priority?: string;
      completed?: boolean;
    } = {};
    if (grouping === "category") {
      if (overContainerTitle !== null) {
        updatedProperties.category = overContainerTitle;
      } else {
        updatedProperties.category = "Other";
      }
    } else if (grouping === "priority") {
      if (overContainerTitle !== null) {
        updatedProperties.priority = overContainerTitle;
      } else {
        updatedProperties.priority = "Other";
      }
    } else if (grouping === "completed") {
      updatedProperties.completed =
        overContainerTitle === "Completed";
    }
    // Use the UPDATE_TASK mutation to update the task in the database
    try {
      console.log("Updating task:", activeItem.id, updatedProperties);
      await updateTask({
        variables: {
          input: {
            id: activeItem.id,
            ...updatedProperties,
          },
        },
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }

    // Handling moving items within and between containers
    if (
      active.id.toString().includes("item") &&
      (over.id.toString().includes("item") ||
        over.id.toString().includes("container"))
    ) {
      const fromContainer = containers.find((container) =>
        container.items.some((item) => item.id === active.id)
      );
      const toContainer = containers.find(
        (container) =>
          container.id ===
          (over.id.toString().includes("item")
            ? overContainer.id
            : over.id)
      );

      if (fromContainer && toContainer) {
        const fromIndex = fromContainer.items.findIndex(
          (item) => item.id === active.id
        );
        const toIndex = over.id.toString().includes("item")
          ? toContainer.items.findIndex((item) => item.id === over.id)
          : toContainer.items.length;

        if (fromContainer === toContainer) {
          let newItems = [...containers];
          newItems[containers.indexOf(fromContainer)].items =
            arrayMove(fromContainer.items, fromIndex, toIndex);
          setContainers(newItems);
        } else {
          let newItems = [...containers];
          const [movingItem] = newItems[
            containers.indexOf(fromContainer)
          ].items.splice(fromIndex, 1);
          newItems[containers.indexOf(toContainer)].items.splice(
            toIndex,
            0,
            movingItem
          );
          setContainers(newItems);
        }
      }
    }

    setActiveId(null);
  };

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
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={containers.map((container) => container.id)}
            >
              {containers.map((container) => (
                <DragCard
                  id={container.id}
                  title={container.title}
                  key={container.id}
                  onAddItem={() => {
                    setShowAddItemModal(true);
                    setCurrentContainerId(container.id);
                  }}
                >
                  <SortableContext
                    items={container.items.map((item) => item.id)}
                  >
                    {container.items.map((item) => (
                      <KanbanItem
                        key={item.id}
                        id={item.id}
                        title={item.title}
                      />
                    ))}
                  </SortableContext>
                </DragCard>
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default Kanban;
