const typeDefs = `#graphql
  type Task {
    id: ID!
    title: String!
    description: String
    priority: Priority!
    deadline: String
    status: Status!
    category: String
    project: Project
  }


  type Project {
    id: ID!
    name: String!
    description: String
    deadline: String
    status: Status!
    tasks: [Task]
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
    projectId: ID
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    priority: Priority
    deadline: String
    status: Status
    category: String
    projectId: ID
  }

  input NewProjectInput {
    name: String!
    description: String
    deadline: String
    status: Status!
  }

  input UpdateProjectInput {
    name: String
    description: String
    deadline: String
    status: Status
  }

  type DeleteTaskResult {
    id: ID!
    success: Boolean!
    message: String!
  }

  type DeleteProjectResult {
    id: ID!
    success: Boolean!
    message: String!
  }

  type Query {
    getAllTasks: [Task]
    getTask(id: ID!): Task
    getAllProjects: [Project]
    getProject(id: ID!): Project
  }

  type Mutation {
    createTask(input: NewTaskInput!): Task
    updateTask(input: UpdateTaskInput!): Task
    deleteTask(id: ID!): DeleteTaskResult
    createProject(input: NewProjectInput!): Project
    updateProject(input: UpdateProjectInput!): Project
    deleteProject(id: ID!): DeleteProjectResult
  }
`;

export default typeDefs;
