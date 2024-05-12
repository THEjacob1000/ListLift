"use client";
import { Task } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { useQuery } from "@apollo/client";
import { FETCH_TASKS } from "@/app/constants";
import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { MobileDataTable } from "./mobileTable/data-table";

const TaskTable = () => {
  const [data, setData] = useState<Task[]>([]);
  const { loading, data: queryData } = useQuery(FETCH_TASKS);
  useEffect(() => {
    if (!loading && queryData) {
      const tasks = queryData.getAllTasks as Task[];
      setData(tasks);
    }
  }, [loading, queryData]);
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });
  if (isDesktop) return <DataTable columns={columns} data={data} />;
  return <MobileDataTable columns={columns} data={data} />;
};

export default TaskTable;
