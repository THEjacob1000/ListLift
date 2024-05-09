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
      status
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
      status
      category
      id
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

export const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
      success
    }
  }
`;
