import { Project, Task } from "@/lib/types";
import { DataTable } from "./table/data-table";
import { columns } from "./table/columns";
import { useQuery } from "@apollo/client";
import { FETCH_PROJECTS, FETCH_TASKS } from "@/app/constants";
import { useEffect, useState } from "react";

interface TaskTableProps {
  type: "task" | "project";
}

const TaskTable = ({ type }: TaskTableProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const { loading, data: queryData } = useQuery(FETCH_TASKS);
  const { loading: loading2, data: queryData2 } =
    useQuery(FETCH_PROJECTS);
  useEffect(() => {
    if (!loading && queryData) {
      const tasks = queryData.getAllTasks as Task[];
      setTasks(tasks);
    }
  }, [loading, queryData]);
  useEffect(() => {
    if (!loading2 && queryData2) {
      const projects = queryData2.getAllProjects as Project[];
      setProjects(projects);
    }
  }, [loading2, queryData2]);
  return (
    <DataTable
      columns={columns}
      tasks={tasks}
      projects={projects}
      type={type}
    />
  );
};

export default TaskTable;
