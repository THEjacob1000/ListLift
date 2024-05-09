import { Button } from "./ui/button";
import { DialogContent } from "./ui/dialog";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { addDays, format } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import {
  CalendarIcon,
  Circle,
  CircleCheckBig,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { projectSchema } from "@/lib/types";

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

interface ProjectFormProps {
  form: UseFormReturn<
    {
      name: string;
      description: string;
      deadline: Date | null;
      status: string;
      tasks: string[];
    },
    any,
    undefined
  >;
  onSubmit: (values: z.infer<typeof projectSchema>) => void;
  setIsOpen: (isOpen: boolean) => void;
  isOpen: boolean;
  type: "new" | "edit";
  onDelete?: () => void;
}

const ProjectForm = ({
  form,
  onSubmit,
  setIsOpen,
  type,
  onDelete,
}: ProjectFormProps) => {
  const completedOptions = [
    { label: "Todo", value: "TODO" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "DONE" },
  ];
  const name = form.watch("name");
  const handleDatePreset = (days: number) => {
    const newDate = addDays(new Date(), days);
    form.setValue("deadline", newDate, { shouldValidate: true });
  };
  const datePresets = [
    { label: "Today", value: 0 },
    { label: "Tomorrow", value: 1 },
    { label: "In 3 days", value: 3 },
    { label: "In 1 week", value: 7 },
  ];
  const statusIcons = {
    TODO: <Circle size={16} />,
    IN_PROGRESS: <Circle size={16} color="#FFAE42" fill="#FFAE42" />,
    DONE: <CircleCheckBig color="#00FF00" size={16} />,
  };
  return (
    <DialogContent className="min-w-[60vw]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-10"
        >
          <div className="col-span-6 flex flex-col gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Project name"
                      className="w-full p-2 bg-card focus:border-none active:border-none focus:outline-none border-none outline-none text-xl focus-visible:ring-transparent"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Description"
                      className="w-full p-2 bg-card h-[40vh] text-md border-none outline-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Separator
            orientation="vertical"
            className="col-span-1 ml-4"
          />
          <div className="col-span-3 flex items-start justify-start flex-col gap-4 pt-4 xl:p-4 w-full">
            <span className="col-span-2 flex justify-start font-semibold">
              Details
            </span>
            <div className="w-full flex justify-between items-center">
              <span className="text-muted-foreground">Status</span>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant={"outline"}
                            className="flex gap-2 w-32 justify-start"
                          >
                            {
                              statusIcons[
                                field.value as keyof typeof statusIcons
                              ]
                            }
                            {field.value
                              ? completedOptions.find(
                                  (option) =>
                                    option.value === field.value
                                )?.label
                              : "Todo"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {completedOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.label}
                              onClick={() =>
                                field.onChange(option.value)
                              }
                              className="flex gap-2 cursor-pointer"
                            >
                              {
                                statusIcons[
                                  option.value as keyof typeof statusIcons
                                ]
                              }
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="w-full flex justify-between items-center">
              <span className="text-muted-foreground">Deadline</span>
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal w-32 pr-2",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>No deadline</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-fit p-0 flex mr-8"
                        align="start"
                      >
                        <div className="flex flex-col">
                          <Button
                            variant={"ghost"}
                            className="flex gap-2 justify-start items-center"
                            onClick={() =>
                              form.setValue("deadline", null, {
                                shouldValidate: true,
                              })
                            }
                          >
                            <CalendarIcon
                              className="h-6 w-6"
                              color="#808080"
                            />
                            {field.value ? (
                              <div className="text-xs inline-flex gap-2 items-center">
                                {format(field.value, "EEE MMM dd")}
                                <X size={12} color="#808080" />
                              </div>
                            ) : (
                              "None"
                            )}
                          </Button>
                          <Calendar
                            className="col-span-1"
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date: Date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </div>

                        <div className="col-span-1 flex flex-col bg-black/20 w-fit">
                          {datePresets.map((preset) => (
                            <Button
                              key={preset.label}
                              variant="ghost"
                              className="flex justify-between gap-4"
                              onClick={() =>
                                handleDatePreset(preset.value)
                              }
                            >
                              {preset.label}
                              <span className="text-muted-foreground">
                                {format(
                                  addDays(new Date(), preset.value),
                                  "EEE MMM dd"
                                )}
                              </span>
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
            </div>
          </div>
          <Separator className="col-span-10" />
          <div className="col-span-10 flex justify-between mt-4 gap-2">
            {type === "new" && <div />}
            {type === "edit" && (
              <Button
                variant={"destructive"}
                type="button"
                onClick={onDelete}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  form.reset();
                  setIsOpen(false);
                }}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={name.length < 3}>
                {type === "new" ? "Add Project" : "Save Project"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default ProjectForm;
