// rate-repository-app/src/components/RepositorySearchInput.jsx
const { useState, useEffect } = require('react');
const { View, TextInput, FlatList, Pressable, StyleSheet } = require('react-native');
const { useLazyQuery } = require('@apollo/client');
const { GET_REPOSITORIES } = require('../graphql/queries');
const Text = require('./Text');
const theme = require('../theme');

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 5,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5, // For Android
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  highlightedItem: {
    backgroundColor: '#f0f0f0',
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 5,
  },
  noResults: {
    padding: 10,
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
  },
});

const RepositorySearchInput = ({
  value,
  onChangeText,
  onSelect,
  placeholder,
  fieldName,
  error,
  touched,
  onBlur,
  searchType,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchRepositories, { data, loading }] = useLazyQuery(GET_REPOSITORIES);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleChangeText = (text) => {
    setSearchTerm(text);
    onChangeText(text);
    
    // Clear previous timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    // Set new timeout to debounce the search
    if (text.length > 2) {
      const timeout = setTimeout(() => {
        searchRepositories({ 
          variables: { 
            searchKeyword: text,
            first: 10 
          } 
        });
        setShowResults(true);
      }, 500);
      setDebounceTimeout(timeout);
    } else {
      setShowResults(false);
    }
  };

  const handleSelect = (repository) => {
    if (searchType === 'owner') {
      // Extract owner name from fullName (format is usually "owner/repo")
      const ownerName = repository.fullName.split('/')[0];
      // Important: Update both the internal state and the parent component
      setSearchTerm(ownerName);
      onSelect(ownerName);
    } else {
      // Extract repository name from fullName
      const repoName = repository.fullName.split('/')[1] || repository.fullName;
      // Important: Update both the internal state and the parent component
      setSearchTerm(repoName);
      onSelect(repoName);
    }
    // Delay hiding results slightly to ensure the selection is applied
    setTimeout(() => {
      setShowResults(false);
    }, 100);
  };

  const handleBlur = () => {
    // Use longer timeout to allow the selection to happen before hiding results
    setTimeout(() => {
      setShowResults(false);
      onBlur();
    }, 300);
  };

  const repositories = data?.repositories?.edges.map(edge => edge.node) || [];
  
  // For owner search type, we'll create a unique list of owners
  let displayResults = repositories;
  
  if (searchType === 'owner' && repositories.length > 0) {
    // Create a map of unique owners
    const uniqueOwners = new Map();
    repositories.forEach(repo => {
      const ownerName = repo.fullName.split('/')[0];
      if (!uniqueOwners.has(ownerName)) {
        uniqueOwners.set(ownerName, repo);
      }
    });
    displayResults = Array.from(uniqueOwners.values());
  }

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          touched && error && styles.inputError,
        ]}
        placeholder={placeholder}
        value={searchTerm}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        onFocus={() => searchTerm.length > 2 && setShowResults(true)}
      />
      {touched && error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      
      {showResults && (
        <View style={styles.resultsContainer}>
          {loading ? (
            <Text style={styles.resultItem}>Searching...</Text>
          ) : displayResults.length > 0 ? (
            <FlatList
              data={displayResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <Text>
                    {searchType === 'owner' 
                      ? item.fullName.split('/')[0] 
                      : item.fullName}
                  </Text>
                </Pressable>
              )}
            />
          ) : searchTerm.length > 2 ? (
            <Text style={styles.noResults}>No results found</Text>
          ) : null}
        </View>
      )}
    </View>
  );
};

module.exports = RepositorySearchInput;