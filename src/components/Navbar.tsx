"use client";
import Image from "next/image";
import Heading from "./Heading";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  Calendar,
  CircleCheckBig,
  FolderDot,
  Search,
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";

const Navbar = () => {
  const router = useRouter();
  const reroute = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex items-center justify-between p-4 px-12">
      <div className="flex items-center justify-between gap-4">
        <CircleCheckBig size={32} />
        <Heading size="sm">List Lift</Heading>
      </div>
      <div className="flex justify-around items-center px-4">
        <Button
          variant={"ghost"}
          className="rounded-lg flex gap-2 p-2 mx-2"
          onClick={() => reroute("/calendar")}
        >
          <Calendar />
          Calendar
        </Button>
        <Button
          variant={"ghost"}
          className="rounded-lg flex gap-2"
          onClick={() => reroute("/projects")}
        >
          <FolderDot />
          Projects
        </Button>
      </div>
      <Dialog>
        <DialogTrigger>
          <div className="inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground p-2">
            <Search />
          </div>
        </DialogTrigger>
        <DialogContent>
          <Command>
            <CommandInput placeholder="Type a command or search..." />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup heading="Suggestions">
                <CommandItem>Calendar</CommandItem>
                <CommandItem>Search Emoji</CommandItem>
                <CommandItem>Calculator</CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
