import Heading from "@/components/Heading";
import TaskTable from "@/components/TaskTable";
import { Suspense } from "react";

const Page = () => {
  return (
    <div className="bg-accent">
      <div className="bg-background pt-6">
        <Suspense>
          <div className="md:mt-6 md:mx-12 md:px-10 mt-2 mx-4 px-2">
            <Heading as="h2" size="sm">
              My Tasks
            </Heading>
            <TaskTable />
          </div>
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
