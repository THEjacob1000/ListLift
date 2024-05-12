"use client";

import Heading from "@/components/Heading";
import { ModeToggle } from "@/components/ModeToggle";
import Navbar from "@/components/Navbar";
import TaskTable from "@/components/TaskTable";
import FullCalendar from "@fullcalendar/react";
import { Kanban } from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function Home() {
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
    <div className="bg-accent">
      <div className="bg-background pt-6">
        <Suspense>
          <div className="mt-6 mx-12 px-10">
            <Heading as="h2" size="sm">
              My Tasks
            </Heading>
            {
              {
                list: <TaskTable />,
                kanban: <Kanban />,
                calendar: <FullCalendar />,
              }[activeView]
            }
          </div>
        </Suspense>
      </div>
    </div>
  );
}
