"use client";

import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTrigger,
} from "./ui/dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  Flag,
  X,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_TASK } from "@/app/constants";
import { useToast } from "./ui/use-toast";

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(0).max(500).optional(),
  deadline: z.date().nullable().optional(),
  priority: z.string(),
  category: z.string().optional(),
  completed: z.boolean().optional(),
});

interface AddTaskProps {
  categories: string[];
}

const AddTask = ({ categories = [] }: AddTaskProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [createTask] = useMutation(CREATE_TASK);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: null as Date | null,
      priority: "LOW",
      category: "",
      completed: false,
    },
  });
  const title = form.watch("title");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("Form Submitted:", values);
    const {
      title,
      description,
      deadline,
      priority,
      category,
      completed,
    } = values || {};
    try {
      await createTask({
        variables: {
          input: {
            title,
            description,
            deadline,
            priority,
            category,
            completed,
          },
        },
      });
      form.reset();
      setIsOpen(false);
      toast({
        title: "Task created",
        description: "The task has been created successfully",
        status: "success",
      });
    } catch (error: any) {
      toast({
        title: "An error occurred",
        description: error.message,
        status: "error",
      });
    }
  };
  const completedOptions = [
    { label: "Todo", value: false },
    { label: "Completed", value: true },
  ];
  const priorityOptions = [
    { label: "Low", value: "LOW" },
    { label: "Medium", value: "MEDIUM" },
    { label: "High", value: "HIGH" },
  ];
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.LOW:
        return "#808080";
      case Priority.MEDIUM:
        return "#FFFF00";
      case Priority.HIGH:
        return "#FF0000";
      default:
        return "#000000";
    }
  };

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4">
        Add Task
      </DialogTrigger>
      <DialogContent className="min-w-[80vw]">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-10"
          >
            <div className="col-span-6 flex flex-col gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Task name"
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
            <div className="col-span-3 grid grid-cols-2 gap-4 p-4 items-start">
              <span className="text-muted-foreground">Status</span>
              <FormField
                control={form.control}
                name="completed"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant={"outline"}
                            className="flex gap-2 w-32 justify-start"
                          >
                            {field.value ? (
                              <CircleCheckBig
                                color="#00FF00"
                                size={16}
                              />
                            ) : (
                              <Circle size={16} />
                            )}
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
                              {option.value ? (
                                <CircleCheckBig
                                  color="#00FF00"
                                  size={16}
                                />
                              ) : (
                                <Circle size={16} />
                              )}
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                  </FormItem>
                )}
              />
              <span className="text-muted-foreground">Priority</span>
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant={"outline"}
                            className="flex gap-2 px-6 justify-start w-32"
                          >
                            <Flag
                              color={
                                field.value === "LOW"
                                  ? "#808080"
                                  : field.value === "MEDIUM"
                                  ? "#FFFF00"
                                  : "#FF0000"
                              }
                              size={20}
                            />
                            {field.value
                              ? priorityOptions.find(
                                  (option) =>
                                    option.value === field.value
                                )?.label
                              : "Todo"}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {Object.values(Priority).map((priority) => (
                            <DropdownMenuItem
                              key={priority}
                              onClick={() =>
                                form.setValue(
                                  "priority",
                                  priority as Priority
                                )
                              }
                              className="flex gap-2 cursor-pointer"
                            >
                              <Flag
                                color={getPriorityColor(priority)}
                                size={20}
                              />
                              {priority}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                  </FormItem>
                )}
              />
              <Separator className="col-span-2" />
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
                              "pl-3 text-left font-normal",
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
              <Separator className="col-span-2" />
              <span className="text-muted-foreground">Category</span>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Dialog
                        open={newCategoryOpen}
                        onOpenChange={setNewCategoryOpen}
                      >
                        <DialogOverlay
                          onClick={(e) => e.stopPropagation()}
                        />

                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button
                              variant={"outline"}
                              className="flex gap-2 px-6 justify-start w-32"
                            >
                              {field.value
                                ? categories.find(
                                    (category) =>
                                      category === field.value
                                  )
                                : "None"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuRadioGroup
                              value={selectedCategory}
                              onValueChange={setSelectedCategory}
                            >
                              <DropdownMenuRadioItem
                                onClick={() => field.onChange("")}
                                value={""}
                                className="cursor-pointer text-muted-foreground"
                              >
                                None
                              </DropdownMenuRadioItem>
                              {categories.map((category) => (
                                <DropdownMenuRadioItem
                                  key={category}
                                  onClick={() =>
                                    field.onChange(category)
                                  }
                                  value={category}
                                  className="flex gap-2 cursor-pointer"
                                >
                                  {category}
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => field.onChange("")}
                              className="cursor-pointer"
                            >
                              <DialogTrigger
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex gap-2 items-center"
                              >
                                <Plus size={16} />
                                New category
                              </DialogTrigger>
                              <DialogContent
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DialogHeader>
                                  Add new Category
                                </DialogHeader>
                                <FormField
                                  control={form.control}
                                  name="category"
                                  render={({ field }) => (
                                    <FormControl>
                                      <Input
                                        placeholder="Category name"
                                        {...field}
                                      />
                                    </FormControl>
                                  )}
                                />
                                <div className="inline-flex gap-2 justify-end">
                                  <Button
                                    variant={"secondary"}
                                    onClick={() =>
                                      setNewCategoryOpen(false)
                                    }
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      categories.push(field.value);
                                      setNewCategoryOpen(false);
                                    }}
                                  >
                                    Add Category
                                  </Button>
                                </div>
                              </DialogContent>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </Dialog>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Separator className="col-span-10" />
            <div className="col-span-10 flex justify-end mt-4 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  form.reset();
                  setIsOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={title.length < 3}>
                Add Task
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTask;
