// rate-repository-app/src/components/RepositorySearchHeader.jsx
const { useState, useEffect } = require('react');
const { View, TextInput, Pressable, StyleSheet, FlatList } = require('react-native');
const { useQuery } = require('@apollo/client');
const { GET_REPOSITORIES } = require('../graphql/queries');
const Text = require('./Text');
const theme = require('../theme');
const { debounce } = require('lodash');

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchContainer: {
    padding: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
    backgroundColor: 'white',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    maxHeight: 200,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  repoName: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  repoDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  repoStats: {
    flexDirection: 'row',
    marginTop: 5,
  },
  statItem: {
    marginRight: 15,
    fontSize: 12,
  },
  searchHint: {
    padding: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
  },
  selectedRepository: {
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: 5,
    margin: 10,
  },
  selectedRepoName: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
});

const RepositorySearchHeader = ({ onSelectRepository, onCancelSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedRepository, setSelectedRepository] = useState(null);
  
  const { data, loading } = useQuery(GET_REPOSITORIES, {
    variables: { searchKeyword, first: 8 },
    skip: searchKeyword.length < 3,
  });

  const repositories = data?.repositories?.edges.map(edge => edge.node) || [];

  // Use debounce to prevent too many API calls
  const debouncedSearch = debounce(value => {
    setSearchKeyword(value);
    if (value.length >= 3) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, 500);

  const handleSearchChange = (text) => {
    debouncedSearch(text);
  };

  const handleSelectRepository = (repo) => {
    setSelectedRepository(repo);
    setShowResults(false);
  };

  const handleConfirmSelection = () => {
    if (selectedRepository) {
      // Extract owner and repository name from fullName
      const parts = selectedRepository.fullName.split('/');
      const ownerName = parts[0];
      const repositoryName = parts.length > 1 ? parts[1] : '';
      
      onSelectRepository({
        id: selectedRepository.id,
        ownerName,
        repositoryName,
        fullName: selectedRepository.fullName
      });
    }
  };

  return (
    <View style={styles.container}>
      {!selectedRepository ? (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search repositories..."
            onChangeText={handleSearchChange}
            autoFocus={true}
          />
        </View>
      ) : (
        <View style={styles.selectedRepository}>
          <Text style={styles.selectedRepoName}>{selectedRepository.fullName}</Text>
          <Text style={styles.repoDescription}>{selectedRepository.description}</Text>
        </View>
      )}

      {showResults && !selectedRepository && (
        <View style={styles.resultsContainer}>
          {repositories.length > 0 ? (
            <FlatList
              data={repositories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable 
                  style={styles.resultItem}
                  onPress={() => handleSelectRepository(item)}
                >
                  <Text style={styles.repoName}>{item.fullName}</Text>
                  {item.description && (
                    <Text style={styles.repoDescription} numberOfLines={1}>
                      {item.description}
                    </Text>
                  )}
                  <View style={styles.repoStats}>
                    <Text style={styles.statItem}>⭐ {item.stargazersCount}</Text>
                    <Text style={styles.statItem}>🍴 {item.forksCount}</Text>
                    <Text style={styles.statItem}>⭐️ {item.ratingAverage}</Text>
                  </View>
                </Pressable>
              )}
            />
          ) : loading ? (
            <Text style={styles.searchHint}>Searching repositories...</Text>
          ) : searchKeyword.length >= 3 ? (
            <Text style={styles.searchHint}>No repositories found</Text>
          ) : (
            <Text style={styles.searchHint}>Type at least 3 characters to search</Text>
          )}
        </View>
      )}

      <View style={styles.buttonsContainer}>
        <Pressable
          style={[styles.button, styles.secondaryButton]}
          onPress={onCancelSearch}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Cancel</Text>
        </Pressable>
        
        {selectedRepository && (
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleConfirmSelection}
          >
            <Text style={[styles.buttonText, styles.primaryButtonText]}>Review This Repo</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

module.exports = RepositorySearchHeader;