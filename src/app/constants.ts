import { gql } from "@apollo/client";

export const FETCH_TASKS = gql`
  query getTasks {
    getAllTasks {
      category
      status
      deadline
      description
      id
      priority
      title
      project
    }
  }
`;

export const FETCH_PROJECTS = gql`
  query getProjects {
    getAllProjects {
      name
      description
      tasks
    }
  }
`;

export const FIND_TASK = gql`
  query findTask($getTaskId: ID!) {
    getTask(id: $getTaskId) {
      category
      status
      deadline
      description
      priority
      title
    }
  }
`;

export const FIND_PROJECT = gql`
  query findProject($getProjectId: ID!) {
    getProject(id: $getProjectId) {
      name
      description
      tasks
    }
  }
`;

export const CREATE_TASK = gql`
  mutation createTask($input: NewTaskInput!, $projectId: ID!) {
    createTask(input: $input, projectId: $projectId) {
      id
      title
      description
      priority
      deadline
      status
      category
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation createProject($input: NewProjectInput!) {
    createProject(input: $input) {
      name
      description
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation updateTask($input: UpdateTaskInput!, $projectId: ID) {
    updateTask(input: $input, projectId: $projectId) {
      title
      description
      priority
      deadline
      status
      category
      id
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation updateProject($input: UpdateProjectInput!) {
    updateProject(input: $input) {
      name
      description
      tasks
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
      success
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
      success
    }
  }
`;
