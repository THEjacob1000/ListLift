import { Resolvers } from "@apollo/client";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  deadline?: string;
  completed: boolean;
  category?: string;
}

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

const resolvers: Resolvers = {
  Query: {
    getAllTasks: async (_, __, { dataSources }) => {
      try {
        return await dataSources.tasks.getAllTasks();
      } catch (error) {
        throw new Error("Failed to fetch tasks");
      }
    },
    getTask: async (_, { id }, { dataSources }) => {
      try {
        return await dataSources.tasks.getTaskById(id);
      } catch (error) {
        throw new Error("Failed to fetch task");
      }
    },
  },
  Mutation: {
    createTask: async (_, { input }, { dataSources }) => {
      try {
        return await dataSources.tasks.createTask(input);
      } catch (error: any) {
        console.error("Detailed error: ", error);
        throw new Error(
          `Failed to create task: ${error.message || error}`
        );
      }
    },
    updateTask: async (_, { id, input }, { dataSources }) => {
      try {
        return await dataSources.tasks.updateTask(id, input);
      } catch (error) {
        throw new Error("Failed to update task");
      }
    },
    deleteTask: async (_, { id }, { dataSources }) => {
      try {
        return await dataSources.tasks.deleteTask(id);
      } catch (error) {
        throw new Error("Failed to delete task");
      }
    },
  },
};

export default resolvers;
