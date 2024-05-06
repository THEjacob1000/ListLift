import { Task } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { useQuery } from "@apollo/client";
import { FETCH_TASKS } from "@/app/constants";
import { useEffect, useState } from "react";

const TaskTable = () => {
  const [data, setData] = useState<Task[]>([]);
  const { loading, data: queryData } = useQuery(FETCH_TASKS);
  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    if (!loading && queryData) {
      const tasks = queryData.getAllTasks as Task[];
      const uniqueCategories = tasks.reduce(
        (acc: string[], task: Task) => {
          if (task.category && !acc.includes(task.category)) {
            acc.push(task.category);
          }
          return acc;
        },
        ["No category"]
      );
      setCategories(uniqueCategories);
      setData(tasks);
    }
  }, [loading, queryData]);
  return <DataTable columns={columns} data={data} />;
};

export default TaskTable;
