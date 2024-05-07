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
      title
      description
      priority
      deadline
      completed
      category
    }
  }
`;
