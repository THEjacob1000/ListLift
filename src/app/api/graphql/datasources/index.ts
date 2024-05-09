import TaskModel from "../models/task";
import ProjectModel from "../models/project";
import { MongoDataSource } from "apollo-datasource-mongodb";

interface TaskDocument extends Document {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  deadline?: string;
  status: string;
  category?: string;
  project: string;
}

interface ProjectDocument extends Document {
  _id: string;
  name: string;
  description?: string;
  deadline: string;
  status: string;
  tasks: TaskDocument[];
}

export class Tasks extends MongoDataSource<TaskDocument> {
  // Function to fetch all tasks
  async getAllTasks(): Promise<TaskDocument[]> {
    try {
      return await TaskModel.find();
    } catch (error) {
      throw new Error("Failed to fetch tasks");
    }
  }

  // Function to fetch all projects
  async getAllProjects(): Promise<ProjectDocument[]> {
    try {
      return await ProjectModel.find().populate("tasks");
    } catch (error) {
      throw new Error("Failed to fetch projects");
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

  // Function to fetch a single project by ID
  async getProjectById(id: string): Promise<TaskDocument[] | null> {
    try {
      const project = await ProjectModel.findById(id).populate(
        "tasks"
      );
      return project;
    } catch (error) {
      throw new Error("Failed to fetch project data");
    }
  }

  // Function to create a new task
  async createTask(
    taskInput: Partial<TaskDocument>,
    projectId: string
  ): Promise<TaskDocument> {
    try {
      console.log("Creating task with input:", taskInput);
      const task = await TaskModel.create({
        ...taskInput,
        project: projectId,
      });
      await ProjectModel.findByIdAndUpdate(projectId, {
        $push: { tasks: task._id },
      });
      return task;
    } catch (error: any) {
      console.error("Error creating task:", error);
      throw new Error(
        `Failed to create task (datasource): ${error.message}`
      );
    }
  }

  // Function to create a project
  async createProject(
    projectInput: Partial<ProjectDocument>
  ): Promise<ProjectDocument> {
    try {
      console.log("Creating project with input:", projectInput);
      const newProject = new ProjectModel(projectInput);
      return await newProject.save();
    } catch (error: any) {
      console.error("Error creating project:", error);
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  // Function to update an existing task
  async updateTask({ input }: any) {
    try {
      const existingTask = await TaskModel.findById(input.id);
      if (!existingTask) {
        throw new Error("Task not found.");
      }
      const updatedTask = await TaskModel.findByIdAndUpdate(
        input.id,
        { ...input },
        {
          new: true,
        }
      );

      // Check if project ID has changed
      if (
        input.projectId &&
        input.projectId !== existingTask.project
      ) {
        // Remove from old project
        await ProjectModel.findByIdAndUpdate(existingTask.project, {
          $pull: { tasks: input.id },
        });
        // Add to new project
        await ProjectModel.findByIdAndUpdate(input.projectId, {
          $push: { tasks: input.id },
        });
      }
    } catch (error) {
      throw new Error("Failed to update task");
    }
  }

  // Function to update an existing project
  async updateProject({ input }: any) {
    try {
      const existingProject = await ProjectModel.findById(input.id);
      if (!existingProject) {
        throw new Error("Project not found.");
      }
      const updatedProject = await ProjectModel.findByIdAndUpdate(
        input.id,
        { ...input },
        {
          new: true,
        }
      );
    } catch (error) {
      throw new Error("Failed to update project");
    }
  }

  // Function to delete a task
  async deleteTask({
    id,
  }: {
    id: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const taskToDelete = await TaskModel.findById(id);
      if (!taskToDelete) {
        return {
          success: false,
          message: "No task found with that ID.",
        };
      }
      const result = await TaskModel.findByIdAndDelete(id);
      if (!result) {
        return {
          success: false,
          message: "Task could not be deleted.",
        };
      }
      // Remove the task from the project
      await ProjectModel.findByIdAndUpdate(taskToDelete.project, {
        $pull: { tasks: id },
      });

      return { success: true, message: "Task deleted successfully" };
    } catch (error) {
      console.error("Error deleting task:", error);
      return { success: false, message: "Failed to delete task" };
    }
  }

  // Function to delete a project
  async deleteProject({
    id,
  }: {
    id: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Find the project to ensure it exists before attempting to delete it
      const projectToDelete = await ProjectModel.findById(id);
      if (!projectToDelete) {
        return {
          success: false,
          message: "No project found with that ID.",
        };
      }
      // First, update all tasks associated with this project to remove the project reference
      await TaskModel.updateMany(
        { project: id },
        { $unset: { project: "" } } // Removes the 'project' field from tasks
      );

      // Now, delete the project itself
      const result = await ProjectModel.findByIdAndDelete(id);
      if (!result) {
        return {
          success: false,
          message: "Project could not be deleted.",
        };
      }

      return {
        success: true,
        message: "Project deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting project:", error);
      return { success: false, message: "Failed to delete project" };
    }
  }
}
