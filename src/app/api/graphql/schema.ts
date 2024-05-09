const typeDefs = `#graphql
  type Task {
    id: ID!
    title: String!
    description: String
    priority: Priority!
    deadline: String
    status: Status!
    category: String
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
  }

  enum Status {
    TODO
    IN_PROGRESS
    DONE
  }

  input NewTaskInput {
    title: String!
    description: String
    priority: Priority!
    deadline: String
    category: String
    status: Status
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    priority: Priority
    deadline: String
    status: Status
    category: String
  }

  type Query {
    getAllTasks(filter: TaskFilterInput): [Task]
    getTask(id: ID!): Task
  }

  input TaskFilterInput {
    priority: Priority
    deadline: String
    status: Status
    category: String
  }
  type DeleteTaskResult {
    id: ID!
    success: Boolean!
    message: String!
  }

  type Mutation {
    createTask(input: NewTaskInput!): Task
    updateTask(input: UpdateTaskInput!): Task
    deleteTask(id: ID!): DeleteTaskResult!
  }
`;

export default typeDefs;
