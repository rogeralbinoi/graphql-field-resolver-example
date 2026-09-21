export const typeDefs = `#graphql
  type Comment {
    id: ID!
    author: String!
    content: String!
  }

  type Post {
    id: ID!
    title: String!
    content: String!
    comments: [Comment!]!
  }

  type Query {
    post(id: ID!): Post!
    posts: [Post!]!
  }
`
