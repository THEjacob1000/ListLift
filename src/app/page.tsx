import Heading from "@/components/Heading";
import Options from "@/components/Options";
import { Suspense } from "react";

export default function Home() {
  return (
    <div className="bg-accent">
      <Heading as="h1" size="md" className="py-2 px-5">
        ListLift
      </Heading>
      <div className="bg-background pt-6">
        <Suspense>
          <Options />
        </Suspense>
      </div>
    </div>
  );
}
