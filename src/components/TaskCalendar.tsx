"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin, {
  Draggable,
  DropArg,
} from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import { Fragment, useEffect, useState } from "react";
import {
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";
import { EventSourceInput } from "@fullcalendar/core/index.js";
import {
  CREATE_TASK,
  DELETE_TASK,
  FETCH_TASKS,
  UPDATE_TASK,
} from "@/app/constants";
import { Task, formSchema } from "@/lib/types";
import { useMutation, useQuery } from "@apollo/client";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "./ui/use-toast";
import TaskForm from "./TaskForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog } from "./ui/dialog";

type newTask = {
  title: string;
  deadline: string;
};

interface TasksData {
  getAllTasks: Task[];
}

type Event = {
  id: string;
  title: string;
  start: string | undefined;
};

const TaskCalendar = () => {
  const [events, setEvents] = useState<Task[]>([]);
  const [allEvents, setAllEvents] = useState<Task[]>([]);
  const [dateEvents, setDateEvents] = useState<Event[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newEvent, setNewEvent] = useState<newTask>({
    title: "",
    deadline: "",
  });
  const [createTask] = useMutation(CREATE_TASK);
  const [updateTask] = useMutation(UPDATE_TASK);
  const [deleteTask] = useMutation(DELETE_TASK, {
    update: (cache, { data }) => {
      if (data.deleteTask.success) {
        const deletedTaskId = data.deleteTask.id;

        const existingTasks = cache.readQuery<TasksData>({
          query: FETCH_TASKS,
        });
        if (existingTasks) {
          const updatedTasks = existingTasks.getAllTasks.filter(
            (task) => task.id !== deletedTaskId
          );

          cache.writeQuery<TasksData>({
            query: FETCH_TASKS,
            data: { getAllTasks: updatedTasks },
          });
        }
      } else {
        // Log or handle the unsuccessful deletion message
        console.error(data.deleteTask.message);
      }
    },
  });
  const { loading, data: queryData, refetch } = useQuery(FETCH_TASKS);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: null as Date | null,
      priority: "LOW",
      category: "",
      status: "TODO",
    },
  });

  useEffect(() => {
    if (!loading && queryData) {
      const tasks = queryData.getAllTasks as Task[];
      setAllEvents(tasks);
      const categoryNames = Array.from(
        new Set(
          tasks
            .map((entry) => entry.category)
            .filter((category): category is string => !!category)
        )
      );
      setCategories(categoryNames);
      const filteredTasks = tasks.filter((task) => !task.deadline);
      setEvents(filteredTasks);
    }
  }, [loading, queryData]);

  useEffect(() => {
    const draggableEl = document.getElementById("draggable-el");
    if (draggableEl) {
      new Draggable(draggableEl, {
        itemSelector: ".fc-event",
        eventData: function (eventEl) {
          return {
            title: eventEl.getAttribute("title"),
            id: eventEl.getAttribute("id"),
            deadline: eventEl.getAttribute("deadline"),
          };
        },
      });
    }
  }, []);
  useEffect(() => {
    const events = allEvents.map((event) => ({
      id: event.id,
      title: event.title,
      start: event.deadline,
    }));
    setDateEvents(events);
  }, [allEvents]);

  const handleDateClick = async (arg: {
    date: Date;
    allDay: Boolean;
  }) => {
    setNewEvent({
      ...newEvent,
      deadline: arg.date.toISOString(),
    });
    form.reset({
      title: "",
      description: "",
      deadline: arg.date,
      priority: "LOW",
      category: "",
      status: "TODO",
    });
    setShowModal(true);
  };

  const addEvent = async (data: DropArg) => {
    const id = data.draggedEl.getAttribute("id");
    const deadlineISO = data.date.toISOString();
    const deadline = deadlineISO.split("T")[0];
    try {
      await updateTask({
        variables: {
          input: {
            deadline,
            id,
          },
        },
      });
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
      });
      refetch({ getTaskId: id });
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };

  const handleDeleteModal = (data: any) => {
    console.log(data);
    const task = allEvents.filter(
      (event) => event.id === data.event.id
    )[0];
    form.reset({
      title: task?.title || "",
      description: task?.description || "",
      deadline: task?.deadline ? new Date(task.deadline) : null,
      priority: task?.priority || "LOW",
      category: task?.category || "",
      status: task?.status || "TODO",
    });
    setShowDeleteModal(true);
    setIdToDelete(data.event.id);
  };

  const onDelete = async () => {
    try {
      const response = await deleteTask({
        variables: { id: idToDelete },
      });
      if (response.data.deleteTask.success) {
        toast({
          title: "Task deleted",
          description: "The task has been deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Task could not be deleted",
        });
      }
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const id = idToDelete;
    const {
      title,
      description,
      deadline,
      priority,
      category,
      status,
    } = values || {};
    try {
      await updateTask({
        variables: {
          input: {
            title,
            description,
            deadline,
            priority,
            category,
            status,
            id,
          },
        },
      });
      refetch({ getTaskId: id });
      setShowDeleteModal(false);
      toast({
        title: "Task updated",
        description: "The task has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
      });
    }
  };

  return (
    <div className="mt-6 w-full">
      <div className="grid grid-cols-10 w-full">
        <div className="col-span-8">
          <FullCalendar
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
            ]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right:
                "resourceTimelineWeek, dayGridMonth,timeGridWeek",
            }}
            events={dateEvents}
            nowIndicator={true}
            editable={true}
            droppable={true}
            selectable={true}
            selectMirror={true}
            dateClick={handleDateClick}
            drop={(data) => addEvent(data)}
            eventClick={(data) => handleDeleteModal(data)}
          />
        </div>
        <ScrollArea
          id="draggable-el"
          className="w-full border-2 p-2 px-3 rounded-md mt-16 lg:h-1/2 bg-background overflow-hidden col-span-2 mx-8"
        >
          <h1 className="font-bold text-lg text-center">Drag Task</h1>

          {events.map((event) => (
            <div
              className="fc-event border-2 p-1 m-2 w-full rounded-md ml-auto text-center bg-primary hover:cursor-pointer"
              title={event.title}
              key={event.id}
              id={event.id}
            >
              {event.title}
            </div>
          ))}
        </ScrollArea>
      </div>
      <Dialog
        onOpenChange={setShowDeleteModal}
        open={showDeleteModal}
      >
        <TaskForm
          categories={categories}
          form={form}
          setIsOpen={setShowDeleteModal}
          onSubmit={onSubmit}
          type="edit"
          onDelete={onDelete}
        />
      </Dialog>
      <Dialog onOpenChange={setShowModal} open={showModal}>
        <TaskForm
          categories={categories}
          form={form}
          setIsOpen={setShowModal}
          onSubmit={onSubmit}
          type="new"
          onDelete={onDelete}
        />
      </Dialog>
    </div>
  );
};

export default TaskCalendar;
