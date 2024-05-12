"use client";

import { Button } from "./ui/button";
import { AlignLeft, Calendar, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useListStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";

const MobileNav = () => {
  const pathName = usePathname();
  const router = useRouter();
  const activeView = pathName.split("/")[1];
  const changeActiveView = (view: string) => {
    router.replace(`/${view}`);
  };
  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full md:hidden h-24 p-1 bg-card/70 rounded-md gap-1 z-50 fixed bottom-0">
        <div className="relative m-2 bg-card rounded-md flex items-center gap-1 overflow-hidden px-12">
          <Button
            className={cn(
              "flex flex-col w-full h-fit",
              activeView === "list" &&
                "bg-accent text-accent-foreground"
            )}
            onClick={() => changeActiveView("list")}
          >
            <AlignLeft className="h-8 w-8" />
            List
          </Button>
          <Button
            className={cn(
              "flex flex-col w-full h-fit",
              activeView === "calendar" &&
                "bg-accent text-accent-foreground"
            )}
            onClick={() => changeActiveView("calendar")}
          >
            <Calendar className="h-8 w-8" />
            Calendar
          </Button>
          <Button
            className={cn(
              "flex flex-col w-full h-fit",
              activeView === "search" &&
                "bg-accent text-accent-foreground"
            )}
            onClick={() => changeActiveView("search")}
          >
            <Search className="h-8 w-8" />
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
