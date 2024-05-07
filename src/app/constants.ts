import { gql } from "@apollo/client";

export const FETCH_TASKS = gql`
  query getTasks {
    getAllTasks {
      category
      completed
      deadline
      description
      id
      priority
      title
    }
  }
`;

export const CREATE_TASK = gql`
  mutation createTask($input: NewTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      priority
      deadline
      completed
      category
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation updateTask($input: UpdateTaskInput!) {
    updateTask(input: $input) {
      title
      description
      priority
      deadline
      completed
      category
      id
    }
  }
`;

export const FIND_TASK = gql`
  query findTask($getTaskId: ID!) {
    getTask(id: $getTaskId) {
      category
      completed
      deadline
      description
      priority
      title
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
