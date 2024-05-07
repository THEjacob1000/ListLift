import { Task } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { useQuery } from "@apollo/client";
import { FETCH_TASKS } from "@/app/constants";
import { useEffect, useState } from "react";

const TaskTable = () => {
  const [data, setData] = useState<Task[]>([]);
  const { loading, data: queryData, refetch } = useQuery(FETCH_TASKS);
  useEffect(() => {
    if (!loading && queryData) {
      const tasks = queryData.getAllTasks as Task[];
      setData(tasks);
    }
  }, [loading, queryData]);
  return <DataTable columns={columns} data={data} />;
};

export default TaskTable;
