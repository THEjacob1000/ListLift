"use client";
import { useEffect, useState } from "react";
import Heading from "./Heading";
import { Button } from "./ui/button";
import { AlignLeft, Columns4, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import TaskTable from "./TaskTable";
import Kanban from "./Kanban";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import FullCalendar from "./TaskCalendar";

const Options = () => {
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<
    "list" | "kanban" | "calendar"
  >(
    (searchParams.get("activeView") as
      | "list"
      | "kanban"
      | "calendar") ?? "list"
  );
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    if (pathName === "/") {
      router.push(`?activeView=${activeView}`);
    } else {
      router.replace(`?activeView=${activeView}`);
    }
  }, [activeView, pathName, router]);
  useEffect(() => {
    const active = searchParams.get("active");
    if (active) {
      setActiveView(active as "list" | "kanban" | "calendar");
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
              variant={activeView === "kanban" ? "default" : "ghost"}
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
            <Button
              variant={
                activeView === "calendar" ? "default" : "ghost"
              }
              onClick={() => setActiveView("calendar")}
              className={cn(
                activeView === "calendar"
                  ? "bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                  : "",
                "gap-2"
              )}
            >
              <Calendar size={24} />
              Calendar
            </Button>
          </div>
        </div>
      </div>
      {
        {
          list: <TaskTable />,
          kanban: <Kanban />,
          calendar: <FullCalendar />,
        }[activeView]
      }
    </div>
  );
};

export default Options;
