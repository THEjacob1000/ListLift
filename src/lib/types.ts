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

export type Project = {
  id: string;
  name: string;
  description: string;
  deadline?: string;
  status: string;
  tasks: Task[];
};

export const taskSchema = z.object({
  title: z.string().min(2).max(50),
  description: z.string().min(0).max(500).optional(),
  deadline: z.date().nullable().optional(),
  priority: z.string(),
  category: z.string().optional(),
  status: z.string(),
});

export const projectSchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().min(0).max(500).optional(),
  deadline: z.date().nullable().optional(),
  status: z.string(),
  tasks: z.array(z.string()).optional(),
});

export type DNDType = {
  id: UniqueIdentifier;
  title: string;
  items: Task[];
};
