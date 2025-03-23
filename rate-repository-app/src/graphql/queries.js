// src/graphql/queries.js
const { gql } = require('@apollo/client');

const GET_REPOSITORIES = gql`
  query {
    repositories {
      edges {
        node {
          id
          fullName
          description
          language
          forksCount
          stargazersCount
          ratingAverage
          reviewCount
          ownerAvatarUrl
        }
      }
    }
  }
`;

const GET_CURRENT_USER = gql`
  query {
    me {
      id
      username
    }
  }
`;

const AUTHENTICATE = gql`
  mutation Authenticate($credentials: AuthenticateInput!) {
    authenticate(credentials: $credentials) {
      accessToken
    }
  }
`;

module.exports = { GET_REPOSITORIES, GET_CURRENT_USER, AUTHENTICATE };