import TaskModel from "../models";
import { MongoDataSource } from "apollo-datasource-mongodb";

interface TaskDocument extends Document {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  completed: boolean;
  category?: string;
}

export default class Tasks extends MongoDataSource<TaskDocument> {
  // Function to fetch all tasks
  async getAllTasks(): Promise<TaskDocument[]> {
    try {
      return await TaskModel.find();
    } catch (error) {
      throw new Error("Failed to fetch tasks");
    }
  }

  // Function to fetch a single task by ID
  async getTaskById(id: string): Promise<TaskDocument | null> {
    try {
      return await TaskModel.findById(id);
    } catch (error) {
      throw new Error("Failed to fetch task");
    }
  }

  // Function to create a new task
  async createTask(
    taskInput: Partial<TaskDocument>
  ): Promise<TaskDocument> {
    try {
      return await TaskModel.create(taskInput);
    } catch (error: any) {
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  // Function to update an existing task
  async updateTask(
    id: string,
    taskInput: Partial<TaskDocument>
  ): Promise<TaskDocument | null> {
    try {
      return await TaskModel.findByIdAndUpdate(id, taskInput, {
        new: true,
      });
    } catch (error) {
      throw new Error("Failed to update task");
    }
  }

  // Function to delete a task
  async deleteTask(id: string): Promise<boolean> {
    try {
      const result = await TaskModel.findByIdAndDelete(id);
      return result != null;
    } catch (error) {
      throw new Error("Failed to delete task");
    }
  }
}