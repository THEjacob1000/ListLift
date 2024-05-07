const typeDefs = `#graphql
  type Task {
    id: ID!
    title: String!
    description: String
    priority: Priority!
    deadline: String
    completed: Boolean!
    category: String
  }

  enum Priority {
    LOW
    MEDIUM
    HIGH
  }

  input NewTaskInput {
    title: String!
    description: String
    priority: Priority!
    deadline: String
    category: String
    completed: Boolean
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    priority: Priority
    deadline: String
    completed: Boolean
    category: String
  }

  type Query {
    getAllTasks(filter: TaskFilterInput): [Task]
    getTask(id: ID!): Task
  }

  input TaskFilterInput {
    priority: Priority
    deadline: String
    completed: Boolean
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
