import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Task, Project } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function capitalize(word: string) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export const isTask = (item: Task | Project): item is Task => {
  return (item as Task).title !== undefined;
};
