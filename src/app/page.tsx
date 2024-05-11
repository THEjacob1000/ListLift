import Heading from "@/components/Heading";
import { ModeToggle } from "@/components/ModeToggle";
import Options from "@/components/Options";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="bg-accent">
      <div className="flex w-full justify-between pr-10 items-center">
        <Heading as="h1" size="sm" className="py-2 px-10">
          ListLift
        </Heading>
        <ModeToggle />
      </div>
      <div className="bg-background pt-6">
        <Suspense>
          <Options />
        </Suspense>
      </div>
    </div>
  );
}
