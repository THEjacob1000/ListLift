"use client";
import { useEffect, useState } from "react";
import Heading from "./Heading";
import { Button } from "./ui/button";
import { AlignLeft, Columns4, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { ModeToggle } from "./ModeToggle";

const Navbar = () => {
  const pathName = usePathname();
  const router = useRouter();
  const activeView = pathName.split("/")[1];
  const changeActiveView = (view: string) => {
    router.replace(`/${view}`);
  };

  return (
    <div className="mx-12 md:flex hidden flex-col">
      <div className="flex justify-between items-center">
        <Heading as="h1" size="sm" className="py-2 px-10">
          ListLift
        </Heading>
        <div className="md:flex hidden justify-between items-center gap-8 px-10">
          <div className="flex justify-center items-center gap-8">
            <div className="flex gap-2">
              <Button
                variant={activeView === "list" ? "default" : "ghost"}
                onClick={() => changeActiveView("list")}
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
                variant={
                  activeView === "kanban" ? "default" : "ghost"
                }
                disabled={activeView === "kanban"}
                onClick={() => changeActiveView("kanban")}
                className={"gap-2"}
              >
                <Columns4 size={24} />
                Kanban
              </Button>
              <Button
                variant={
                  activeView === "calendar" ? "default" : "ghost"
                }
                onClick={() => changeActiveView("calendar")}
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
          <ModeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
