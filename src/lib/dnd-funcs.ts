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
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { Task } from "./types";
import { useMutation } from "@apollo/client";

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

export const findItemTitle = (
  id: UniqueIdentifier | undefined,
  containers: DNDType[]
) => {
  const container = findValueOfItems(id, "item", containers);
  if (!container) return "";
  const item = container.items.find(
    (item: { id: UniqueIdentifier | undefined }) => item.id === id
  );
  if (!item) return "";
  return item.title;
};

export const findContainerTitle = (
  id: UniqueIdentifier | undefined,
  containers: DNDType[]
) => {
  const container = findValueOfItems(id, "container", containers);
  if (!container) return "";
  return container.title;
};

export const findContainerItems = (
  id: UniqueIdentifier | undefined,
  containers: DNDType[]
) => {
  const container = findValueOfItems(id, "container", containers);
  if (!container) return [];
  return container.items;
};
export const findContainerFromItem = (
  itemId: string,
  groupedData: GroupedTasks
) => {
  let containerTitle = null;
  Object.entries(groupedData).forEach(([groupName, tasks]) => {
    if (tasks.some((task) => task.id === itemId)) {
      containerTitle = groupName;
    }
  });
  return containerTitle;
};

// DND Logic

export const handleDragStart = (
  event: DragStartEvent,
  setActiveId: (id: UniqueIdentifier | null) => void
) => {
  const { active } = event;
  const { id } = active;
  setActiveId(id);
};
export const handleDragMove = (
  event: DragMoveEvent,
  containers: DNDType[],
  setContainers: (containers: DNDType[]) => void
) => {
  const { active, over } = event;
  // Handle Items Sorting
  if (
    active.id.toString().includes("item") &&
    over?.id.toString().includes("item") &&
    active &&
    over &&
    active.id !== over.id
  ) {
    // Find the active container and over container
    const activeContainer = findValueOfItems(
      active.id,
      "item",
      containers
    );
    const overContainer = findValueOfItems(
      over.id,
      "item",
      containers
    );

    // If the active or over container is not found, return
    if (!activeContainer || !overContainer) return;

    // Find the index of the active and over container
    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id
    );
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id
    );

    // Find the index of the active and over item
    const activeitemIndex = activeContainer.items.findIndex(
      (item) => item.id === active.id
    );
    const overitemIndex = overContainer.items.findIndex(
      (item) => item.id === over.id
    );
    // In the same container
    if (activeContainerIndex === overContainerIndex) {
      let newItems = [...containers];
      newItems[activeContainerIndex].items = arrayMove(
        newItems[activeContainerIndex].items,
        activeitemIndex,
        overitemIndex
      );

      setContainers(newItems);
    } else {
      // In different containers
      let newItems = [...containers];
      const [removeditem] = newItems[
        activeContainerIndex
      ].items.splice(activeitemIndex, 1);
      newItems[overContainerIndex].items.splice(
        overitemIndex,
        0,
        removeditem
      );
      setContainers(newItems);
    }
  }

  // Handling Item Drop Into a Container
  if (
    active.id.toString().includes("item") &&
    over?.id.toString().includes("container") &&
    active &&
    over &&
    active.id !== over.id
  ) {
    // Find the active and over container
    const activeContainer = findValueOfItems(
      active.id,
      "item",
      containers
    );
    const overContainer = findValueOfItems(
      over.id,
      "container",
      containers
    );

    // If the active or over container is not found, return
    if (!activeContainer || !overContainer) return;

    // Find the index of the active and over container
    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id
    );
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id
    );

    // Find the index of the active and over item
    const activeitemIndex = activeContainer.items.findIndex(
      (item) => item.id === active.id
    );

    // Remove the active item from the active container and add it to the over container
    let newItems = [...containers];
    const [removeditem] = newItems[activeContainerIndex].items.splice(
      activeitemIndex,
      1
    );
    newItems[overContainerIndex].items.push(removeditem);
    setContainers(newItems);
  }
};
export const handleDragEnd = async (
  event: DragEndEvent,
  containers: DNDType[],
  setContainers: (containers: DNDType[]) => void,
  groupedData: GroupedTasks,
  grouping: string,
  updateTask: any,
  setActiveId: (id: UniqueIdentifier | null) => void
) => {
  const { active, over } = event;
  if (!over) return;
  console.log(over.id);

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
  const activeContainer = findValueOfItems(
    active.id,
    "item",
    containers
  );
  const overContainer =
    findValueOfItems(over.id, "item", containers) || over.id;
  console.log("Active Container:", activeContainer);
  console.log("Over Container:", overContainer);
  if (!activeContainer || !overContainer) return;
  const activeItem = activeContainer.items.find(
    (item: { id: UniqueIdentifier }) => item.id === active.id
  );
  const overContainerTitle = findContainerFromItem(
    over.id as string,
    groupedData
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
      updatedProperties.priority = (
        overContainerTitle as string
      ).toUpperCase();
    } else {
      updatedProperties.priority = (over.id as string).toUpperCase();
    }
  } else if (grouping === "completed") {
    updatedProperties.completed = overContainerTitle === "Completed";
  }

  console.log("Active Item:", activeItem);
  // Use the UPDATE_TASK mutation to update the task in the database
  try {
    console.log("New Container:", overContainerTitle);
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
          ? (overContainer as DNDType).id
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
        newItems[containers.indexOf(fromContainer)].items = arrayMove(
          fromContainer.items,
          fromIndex,
          toIndex
        );
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

export const findValueOfItems = (
  id: UniqueIdentifier | undefined,
  type: string,
  containers: DNDType[]
) => {
  if (type === "container") {
    return containers.find((item) => item.id === id);
  }
  if (type === "item") {
    return containers.find((container) =>
      container.items.find((item) => item.id === id)
    );
  }
};
