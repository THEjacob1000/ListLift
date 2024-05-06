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
