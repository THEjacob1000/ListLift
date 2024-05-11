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
import { UseFormReturn, useForm } from "react-hook-form";
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
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Calendar } from "./ui/calendar";

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
  status: z.string(),
});

interface TaskFormProps {
  form: UseFormReturn<
    {
      title: string;
      description: string;
      deadline: Date | null;
      priority: string;
      category: string;
      status: string;
    },
    any,
    undefined
  >;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  categories: string[];
  setIsOpen: (isOpen: boolean) => void;
  type: "new" | "edit";
  onDelete?: () => void;
}

const TaskForm = ({
  form,
  onSubmit,
  categories,
  setIsOpen,
  type,
  onDelete,
}: TaskFormProps) => {
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const completedOptions = [
    { label: "Todo", value: "TODO" },
    { label: "In Progress", value: "IN_PROGRESS" },
    { label: "Completed", value: "DONE" },
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
  const title = form.watch("title");
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
                            color={getPriorityColor(
                              field.value as Priority
                            )}
                            size={20}
                          />
                          {field.value
                            ? priorityOptions.find(
                                (option) =>
                                  option.value === field.value
                              )?.label
                            : "Low"}
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
                          disabled={(date: Date) => date < new Date()}
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
              <Button type="submit" disabled={title.length < 3}>
                {type === "new" ? "Add Task" : "Save Task"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};

export default TaskForm;
