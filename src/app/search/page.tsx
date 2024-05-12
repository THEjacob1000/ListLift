"use client";

import { Input } from "@/components/ui/input";
import { Task } from "@/lib/types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { FETCH_TASKS } from "../constants";
import { Circle, CircleCheckBig } from "lucide-react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import MobileTaskItem from "@/components/MobileTaskItem";
import TaskAdd from "@/components/TaskAdd";
import Heading from "@/components/Heading";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const Page = () => {
  const [filter, setFilter] = useState("");
  const [data, setData] = useState<Task[]>([]);
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

  return (
    <div className="px-3 mx-4 flex flex-col gap-4 mt-4">
      <Heading as="h2" size="sm">
        My Tasks
      </Heading>
      <Input
        className="max-w-sm"
        placeholder="Search tasks..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ScrollArea className="h-[80vh]">
        <div className="flex flex-col gap-2 items-start justify-start">
          {data
            .filter((task) =>
              task.title.toLowerCase().includes(filter.toLowerCase())
            )
            .map((task) => (
              <MobileTaskItem task={task} key={task.id} />
            ))}
        </div>
      </ScrollArea>
      <TaskAdd categories={categoryNames} />
    </div>
  );
};

export default Page;
