import { create } from "zustand";

interface ListState {
  activeView: "list" | "kanban" | "calendar" | "search";
  setActiveView: (
    activeView: "list" | "kanban" | "calendar" | "search"
  ) => void;
}

export const useListStore = create<ListState>((set) => ({
  activeView: "list",
  setActiveView: (activeView) => set({ activeView }),
}));
