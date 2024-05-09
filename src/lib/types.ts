import { UniqueIdentifier } from "@dnd-kit/core";
import { z } from "zod";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  status: string;
  category?: string;
  [key: string]: any;
};

export const formSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(0).max(500).optional(),
  deadline: z.date().nullable().optional(),
  priority: z.string(),
  category: z.string().optional(),
  status: z.string(),
});

export type DNDType = {
  id: UniqueIdentifier;
  title: string;
  items: Task[];
};
