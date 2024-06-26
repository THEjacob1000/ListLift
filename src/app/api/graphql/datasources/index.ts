import TaskModel from "../models";
import { MongoDataSource } from "apollo-datasource-mongodb";

interface TaskDocument extends Document {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  status: string;
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
      console.log("Creating task with input:", taskInput);
      return await TaskModel.create(taskInput);
    } catch (error: any) {
      console.error("Error creating task:", error);
      throw new Error(
        `Failed to create task (datasource): ${error.message}`
      );
    }
  }

  // Function to update an existing task
  async updateTask({ input }: any) {
    try {
      const updatedTask = await TaskModel.findByIdAndUpdate(
        input.id,
        { ...input },
        {
          new: true,
        }
      );
      return updatedTask;
    } catch (error) {
      throw new Error("Failed to update user");
    }
  }

  // Function to delete a task
  async deleteTask({
    id,
  }: {
    id: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const result = await TaskModel.findByIdAndDelete(id);
      if (!result) {
        return {
          success: false,
          message: "No task found with that ID.",
        };
      }
      return { success: true, message: "Task deleted successfully" };
    } catch (error) {
      console.error("Error deleting task:", error);
      return { success: false, message: "Failed to delete task" };
    }
  }
}
