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
    updateTask: async (_: any, { input }: any, context: any) => {
      try {
        return await context.dataSources.tasks.updateTask({ input });
      } catch (error) {
        throw new Error("Failed to update task");
      }
    },
    deleteTask: async (_, { id }, context) => {
      const deleteResult = await context.dataSources.tasks.deleteTask(
        { id }
      );
      if (!deleteResult.success) {
        return {
          id: "",
          success: false,
          message: deleteResult.message,
        };
      }
      return {
        id: id,
        success: true,
        message: "Task successfully deleted.",
      };
    },
  },
};

export default resolvers;
