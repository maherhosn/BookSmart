import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    _id: ID
    username: String
    email: String
    password: String
    bookCount: Int!
    savedBooks: [Book]!
  }

  type Book {
    bookId: String!
    authors: [String]!
    description: String
    title: String!
    image: String
    link: String
  }

  type Auth {
    token: ID!
    user: User
  }


  input BookInput {
    bookId: String!
    authors: [String]!
    description: String
    title: String!
    image: String
    link: String
  }

  type Query {
    users: [User]!
    getSingleUser(id: String, username: String): User
    me: User
  }

  type Mutation {
    login(username: String, email: String, password: String!): Auth
    addUser(username: String!, email: String!, password: String!): Auth
    saveBook(bookData: BookInput!): User
    removeBook(bookId: String!): User
  }
`;

export default typeDefs;

