"use client";

import { Input } from "@/components/ui/input";
import { Task } from "@/lib/types";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { FETCH_TASKS } from "../constants";
import { Circle, CircleCheckBig } from "lucide-react";
import { Drawer, DrawerTrigger } from "@/components/ui/drawer";
import MobileTaskItem from "@/components/MobileTaskItem";

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

  return (
    <div className="pl-2 pr-8 mx-4 flex flex-col gap-4">
      <Input
        className="max-w-sm"
        placeholder="Search tasks..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="flex flex-col gap-2 items-start justify-start">
        {data
          .filter((task) =>
            task.title.toLowerCase().includes(filter.toLowerCase())
          )
          .map((task) => (
            <MobileTaskItem task={task} key={task.id} />
          ))}
      </div>
    </div>
  );
};

export default Page;
