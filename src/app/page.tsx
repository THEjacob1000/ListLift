"use client";
import Heading from "@/components/Heading";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  router.push("/list");
  return (
    <div className="bg-accent">
      <div className="bg-background pt-6">
        <Suspense>
          <div className="md:mt-6 md:mx-12 md:px-10 mt-2 mx-4 px-2">
            <Heading as="h2" size="sm">
              My Tasks
            </Heading>
          </div>
        </Suspense>
      </div>
    </div>
  );
}
