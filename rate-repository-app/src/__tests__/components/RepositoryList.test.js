// rate-repository-app/src/__tests__/components/RepositoryList.test.js
import { render, screen } from '@testing-library/react-native';
import { RepositoryListContainer } from '../../components/RepositoryList';
import React from 'react';
import { format } from 'date-fns';

// Mock the useNavigate hook
jest.mock('react-router-native', () => ({
  useNavigate: () => jest.fn(),
}));

describe('RepositoryList', () => {
  describe('RepositoryListContainer', () => {
    it('renders repository information correctly', () => {
      const repositories = {
        totalCount: 8,
        pageInfo: {
          hasNextPage: true,
          endCursor:
            'WyJhc3luYy1saWJyYXJ5LnJlYWN0LWFzeW5jIiwxNTg4NjU2NzUwMDc2XQ==',
          startCursor: 'WyJqYXJlZHBhbG1lci5mb3JtaWsiLDE1ODg2NjAzNTAwNzZd',
        },
        edges: [
          {
            node: {
              id: 'jaredpalmer.formik',
              fullName: 'jaredpalmer/formik',
              description: 'Build forms in React, without the tears',
              language: 'TypeScript',
              forksCount: 1619,
              stargazersCount: 21856,
              ratingAverage: 88,
              reviewCount: 3,
              ownerAvatarUrl:
                'https://avatars2.githubusercontent.com/u/4060187?v=4',
            },
            cursor: 'WyJqYXJlZHBhbG1lci5mb3JtaWsiLDE1ODg2NjAzNTAwNzZd',
          },
          {
            node: {
              id: 'async-library.react-async',
              fullName: 'async-library/react-async',
              description: 'Flexible promise-based React data loader',
              language: 'JavaScript',
              forksCount: 69,
              stargazersCount: 1760,
              ratingAverage: 72,
              reviewCount: 3,
              ownerAvatarUrl:
                'https://avatars1.githubusercontent.com/u/54310907?v=4',
            },
            cursor:
              'WyJhc3luYy1saWJyYXJ5LnJlYWN0LWFzeW5jIiwxNTg4NjU2NzUwMDc2XQ==',
          },
        ],
      };

      // Render the RepositoryListContainer component
      render(<RepositoryListContainer repositories={repositories} />);

      // Get all repository items
      const repositoryItems = screen.getAllByTestId('repositoryItem');
      
      // Check that there are exactly 2 repository items
      expect(repositoryItems).toHaveLength(2);

      // Test the first repository
      const [firstRepositoryItem, secondRepositoryItem] = repositoryItems;

      // First repository - jaredpalmer/formik
      expect(firstRepositoryItem).toHaveTextContent('jaredpalmer/formik');
      expect(firstRepositoryItem).toHaveTextContent('Build forms in React, without the tears');
      expect(firstRepositoryItem).toHaveTextContent('TypeScript');
      expect(firstRepositoryItem).toHaveTextContent('1.6k'); // Formatted forks count
      expect(firstRepositoryItem).toHaveTextContent('21.9k'); // Formatted stars count
      expect(firstRepositoryItem).toHaveTextContent('88'); // Rating average
      expect(firstRepositoryItem).toHaveTextContent('3'); // Review count

      // Second repository - async-library/react-async
      expect(secondRepositoryItem).toHaveTextContent('async-library/react-async');
      expect(secondRepositoryItem).toHaveTextContent('Flexible promise-based React data loader');
      expect(secondRepositoryItem).toHaveTextContent('JavaScript');
      expect(secondRepositoryItem).toHaveTextContent('69'); // Forks count
      expect(secondRepositoryItem).toHaveTextContent('1.8k'); // Formatted stars count
      expect(secondRepositoryItem).toHaveTextContent('72'); // Rating average
      expect(secondRepositoryItem).toHaveTextContent('3'); // Review count
    });
  });
});