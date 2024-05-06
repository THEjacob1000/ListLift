export type Task = {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  completed: boolean;
  category?: string;
  [key: string]: any;
};
