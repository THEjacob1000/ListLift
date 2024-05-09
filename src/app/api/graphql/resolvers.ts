import { Resolvers } from "@apollo/client";

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
    getAllProjects: async (_, __, { dataSources }) => {
      try {
        return await dataSources.tasks.getAllProjects();
      } catch (error: any) {
        throw new Error(
          "Failed to fetch projects (resolver):",
          error.message
        );
      }
    },
    getProject: async (_, { id }, { dataSources }) => {
      try {
        return await dataSources.tasks.getProjectById(id);
      } catch (error) {
        throw new Error("Failed to fetch project");
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
          `Failed to create task (resolver): ${
            error.message || error
          }`
        );
      }
    },
    updateTask: async (_: any, { input }: any, context: any) => {
      try {
        console.log("Received input for update:", input);
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
    createProject: async (_, { input }, { dataSources }) => {
      try {
        return await dataSources.tasks.createProject(input);
      } catch (error: any) {
        console.error("Detailed error: ", error);
        throw new Error(
          `Failed to create Project (resolver): ${
            error.message || error
          }`
        );
      }
    },
    updateProject: async (_: any, { input }: any, context: any) => {
      try {
        console.log("Received input for update:", input);
        return await context.dataSources.tasks.updateProject({
          input,
        });
      } catch (error) {
        throw new Error("Failed to update Project");
      }
    },
    deleteProject: async (_, { id }, context) => {
      const deleteResult =
        await context.dataSources.tasks.deleteProject({ id });
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
        message: "Project successfully deleted.",
      };
    },
  },
};

export default resolvers;
