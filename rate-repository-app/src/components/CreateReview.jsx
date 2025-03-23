// rate-repository-app/src/components/CreateReview.jsx
const { View, TextInput, StyleSheet, FlatList, Alert, TouchableOpacity } = require('react-native');
const { useState } = require('react');
const { useNavigate } = require('react-router-native');
const { useFormik } = require('formik');
const { useMutation, useLazyQuery } = require('@apollo/client');
const { CREATE_REVIEW, GET_REPOSITORIES } = require('../graphql/queries');
const Text = require('./Text');
const theme = require('../theme');
const { debounce } = require('lodash');
const yup = require('yup');

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchSection: {
    marginBottom: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    maxHeight: 200,
    marginTop: 5,
    marginBottom: 10,
    zIndex: 10, // Ensure it appears above other content
  },
  resultItem: {
    padding: 16, // Increased for better touch targets
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedRepo: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  repoName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.primary,
  },
  repoDescription: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  searchHint: {
    padding: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: theme.colors.textSecondary,
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
  multilineInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 5,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButton: {
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    marginBottom: 10,
  },
  clearButtonText: {
    color: theme.colors.textPrimary,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 2,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.textPrimary,
  },
  repositoryStats: {
    flexDirection: 'row',
    marginTop: 5,
  },
  statItem: {
    marginRight: 15,
    fontSize: 12,
    color: theme.colors.textSecondary,
  }
});

// Validation schemas
const repoValidationSchema = yup.object().shape({
  searchTerm: yup.string(),
});

const reviewValidationSchema = yup.object().shape({
  rating: yup
    .number()
    .required('Rating is required')
    .min(0, 'Rating must be at least 0')
    .max(100, 'Rating must be at most 100')
    .typeError('Rating must be a number'),
  text: yup.string(),
});

const CreateReview = () => {
  const navigate = useNavigate();
  const [createReview, { loading }] = useMutation(CREATE_REVIEW);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [searchRepositories, { data, loading: searchLoading }] = useLazyQuery(GET_REPOSITORIES, {
    fetchPolicy: 'network-only', // Force a fresh fetch each time
  });
  const [debouncedSearch] = useState(() => 
    debounce((text) => {
      if (text.length >= 2) { // Reduced minimum characters to 2
        searchRepositories({ variables: { searchKeyword: text, first: 10 } });
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300) // Reduced debounce time for better responsiveness
  );

  // Form for repository search
  const searchFormik = useFormik({
    initialValues: {
      searchTerm: '',
    },
    validationSchema: repoValidationSchema,
    onSubmit: () => {
      // Not needed for this implementation
    },
  });

  // Form for review submission
  const reviewFormik = useFormik({
    initialValues: {
      rating: '',
      text: '',
    },
    validationSchema: reviewValidationSchema,
    onSubmit: async (values) => {
      if (!selectedRepository) {
        Alert.alert('Error', 'Please select a repository first');
        return;
      }

      try {
        const { data } = await createReview({
          variables: {
            review: {
              repositoryName: selectedRepository.repositoryName,
              ownerName: selectedRepository.ownerName,
              rating: Number(values.rating),
              text: values.text,
            },
          },
        });

        const repositoryId = data.createReview.repositoryId;
        navigate(`/repositories/${repositoryId}`);
      } catch (e) {
        console.log('Error creating review:', e);
        
        // Handle specific error cases
        if (e.message.includes('User has already reviewed this repository')) {
          Alert.alert(
            'Error',
            'You have already reviewed this repository. You can edit your review from the My Reviews section.',
            [
              { 
                text: 'Go to My Reviews', 
                onPress: () => navigate('/my-reviews') 
              },
              {
                text: 'Choose Another Repository',
                onPress: () => clearSelectedRepository()
              }
            ]
          );
        } else {
          // Generic error handling
          Alert.alert('Error', `Failed to create review: ${e.message}`);
        }
      }
    },
  });

  const handleRepositorySelect = (repository) => {
    // Extract owner and repository name from fullName
    const parts = repository.fullName.split('/');
    const ownerName = parts[0];
    const repositoryName = parts.length > 1 ? parts[1] : '';
    
    setSelectedRepository({
      id: repository.id,
      fullName: repository.fullName,
      ownerName,
      repositoryName,
      description: repository.description,
      ratingAverage: repository.ratingAverage,
      reviewCount: repository.reviewCount,
      stargazersCount: repository.stargazersCount
    });
    
    setShowResults(false);
    searchFormik.setFieldValue('searchTerm', '');
  };

  const handleSearchChange = (text) => {
    searchFormik.setFieldValue('searchTerm', text);
    debouncedSearch(text);
  };

  const clearSelectedRepository = () => {
    setSelectedRepository(null);
    reviewFormik.resetForm();
  };

  // Filter repositories based on search term to ensure we're only showing relevant results
  const repositories = data?.repositories?.edges.map(edge => edge.node) || [];

  // Ensure the keyboard dismisses when tapping outside input
  const dismissKeyboard = () => {
    setShowResults(false);
  };

  return (
    <TouchableOpacity 
      activeOpacity={1} 
      onPress={dismissKeyboard} 
      style={styles.container}
    >
      <Text style={styles.sectionTitle}>1. Find a Repository</Text>
      
      {!selectedRepository ? (
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search repositories (min 2 characters)..."
            value={searchFormik.values.searchTerm}
            onChangeText={handleSearchChange}
            onBlur={() => {
              // Delay hiding results to allow touch events to complete
              setTimeout(() => setShowResults(false), 150);
            }}
            onFocus={() => searchFormik.values.searchTerm.length >= 2 && setShowResults(true)}
          />
          
          {showResults && (
            <View style={styles.resultsContainer}>
              {searchLoading ? (
                <Text style={styles.searchHint}>Searching...</Text>
              ) : repositories.length > 0 ? (
                <FlatList
                  data={repositories}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={styles.resultItem}
                      onPress={() => handleRepositorySelect(item)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.repoName}>{item.fullName}</Text>
                      {item.description && (
                        <Text style={styles.repoDescription} numberOfLines={1}>
                          {item.description}
                        </Text>
                      )}
                      <View style={styles.repositoryStats}>
                        <Text style={styles.statItem}>⭐ {item.stargazersCount}</Text>
                        <Text style={styles.statItem}>👁️ {item.reviewCount} reviews</Text>
                        <Text style={styles.statItem}>Rating: {item.ratingAverage}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              ) : searchFormik.values.searchTerm.length >= 2 ? (
                <Text style={styles.searchHint}>No repositories found</Text>
              ) : (
                <Text style={styles.searchHint}>Type at least 2 characters to search</Text>
              )}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.selectedRepo}>
          <Text style={styles.repoName}>{selectedRepository.fullName}</Text>
          {selectedRepository.description && (
            <Text style={styles.repoDescription}>{selectedRepository.description}</Text>
          )}
          <View style={styles.repositoryStats}>
            {selectedRepository.stargazersCount !== undefined && (
              <Text style={styles.statItem}>⭐ {selectedRepository.stargazersCount}</Text>
            )}
            {selectedRepository.reviewCount !== undefined && (
              <Text style={styles.statItem}>👁️ {selectedRepository.reviewCount} reviews</Text>
            )}
            {selectedRepository.ratingAverage !== undefined && (
              <Text style={styles.statItem}>Rating: {selectedRepository.ratingAverage}</Text>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.button, styles.clearButton]} 
            onPress={clearSelectedRepository}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>
              Change Repository
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.divider} />
      
      <Text style={styles.sectionTitle}>2. Write Your Review</Text>
      
      <View style={{ opacity: selectedRepository ? 1 : 0.5 }}>
        <Text style={styles.label}>Rating (0-100)</Text>
        <TextInput
          style={[
            styles.input,
            reviewFormik.touched.rating && reviewFormik.errors.rating && styles.inputError,
          ]}
          placeholder="Rating between 0 and 100"
          value={reviewFormik.values.rating}
          onChangeText={reviewFormik.handleChange('rating')}
          onBlur={() => reviewFormik.setFieldTouched('rating')}
          keyboardType="numeric"
          editable={!!selectedRepository}
        />
        {reviewFormik.touched.rating && reviewFormik.errors.rating && (
          <Text style={styles.errorText}>{reviewFormik.errors.rating}</Text>
        )}

        <Text style={styles.label}>Review</Text>
        <TextInput
          style={[
            styles.input,
            styles.multilineInput,
            reviewFormik.touched.text && reviewFormik.errors.text && styles.inputError,
          ]}
          placeholder="Write your review here"
          value={reviewFormik.values.text}
          onChangeText={reviewFormik.handleChange('text')}
          onBlur={() => reviewFormik.setFieldTouched('text')}
          multiline
          editable={!!selectedRepository}
        />
        {reviewFormik.touched.text && reviewFormik.errors.text && (
          <Text style={styles.errorText}>{reviewFormik.errors.text}</Text>
        )}

        <TouchableOpacity 
          style={[styles.button, !selectedRepository && { opacity: 0.5 }]} 
          onPress={reviewFormik.handleSubmit}
          disabled={loading || !selectedRepository}
          activeOpacity={selectedRepository ? 0.7 : 1}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating review...' : 'Create review'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

module.exports = CreateReview;