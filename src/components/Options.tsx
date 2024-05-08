"use client";
import { useEffect, useState } from "react";
import Heading from "./Heading";
import { Button } from "./ui/button";
import {
  AlignLeft,
  Columns4,
  FolderDot,
  SquareCheckBig,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TaskTable from "./TaskTable";
import Kanban from "./Kanban";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

const Options = () => {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<"list" | "kanban">(
    searchParams.get("activeView") === "kanban" ? "kanban" : "list"
  );
  const [viewType, setViewType] = useState<"projects" | "tasks">(
    searchParams.get("viewType") === "projects" ? "projects" : "tasks"
  );
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (pathName === "/") {
      router.push(`?activeView=${activeView}&viewType=${viewType}`);
    } else {
      router.replace(
        `?activeView=${activeView}&viewType=${viewType}`
      );
    }
  }, [activeView, pathName, router, viewType]);
  useEffect(() => {
    const view = searchParams.get("view");
    const active = searchParams.get("active");
    if (view) {
      setViewType(view as "projects" | "tasks");
    }
    if (active) {
      setActiveView(active as "list" | "kanban");
    }
  }, [searchParams]);
  return (
    <div className="mx-12 flex flex-col">
      <div className="flex justify-between items-center">
        <Heading as="h2" size="sm">
          My Tasks
        </Heading>
        <div className="flex justify-center items-center gap-8">
          <div className="flex gap-2">
            <Button
              variant={activeView === "list" ? "default" : "ghost"}
              onClick={() => setActiveView("list")}
              className={cn(
                activeView === "list"
                  ? "bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                  : "",
                "gap-2"
              )}
            >
              <AlignLeft size={24} />
              List
            </Button>
            <Button
              variant={activeView === "list" ? "ghost" : "default"}
              onClick={() => setActiveView("kanban")}
              className={cn(
                activeView === "kanban"
                  ? "bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                  : "",
                "gap-2"
              )}
            >
              <Columns4 size={24} />
              Kanban
            </Button>
          </div>
          <div className="gap-2 flex">
            <Button
              variant={viewType === "tasks" ? "default" : "ghost"}
              onClick={() => setViewType("tasks")}
              className={cn(
                viewType === "tasks"
                  ? "bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                  : "",
                "gap-2"
              )}
            >
              <SquareCheckBig size={24} />
              Tasks
            </Button>
            <Button
              variant={viewType === "tasks" ? "ghost" : "default"}
              onClick={() => setViewType("projects")}
              className={cn(
                viewType === "projects"
                  ? "bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                  : "",
                "gap-2"
              )}
            >
              <FolderDot size={24} />
              Projects
            </Button>
          </div>
        </div>
      </div>
      {activeView === "list" ? <TaskTable /> : <Kanban />}
    </div>
  );
};

export default Options;
