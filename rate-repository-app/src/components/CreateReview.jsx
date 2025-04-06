// rate-repository-app/src/components/CreateReview.jsx
const { 
  View, 
  TextInput, 
  StyleSheet, 
  Alert, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  Modal
} = require('react-native');
const { useState, useRef } = require('react');
const { useNavigate } = require('react-router-native');
const { useFormik } = require('formik');
const { useMutation, useLazyQuery } = require('@apollo/client');
const { CREATE_REVIEW, SEARCH_REPOSITORIES } = require('../graphql/queries');
const Text = require('./Text');
const theme = require('../theme');
const { debounce } = require('lodash');
const yup = require('yup');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    padding: 15,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '100%',
    maxHeight: '80%',
    padding: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: theme.colors.textPrimary,
  },
  resultsContainer: {
    paddingBottom: 10,
  },
  resultItem: {
    padding: 16,
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
  searchError: {
    padding: 15,
    textAlign: 'center',
    color: theme.colors.error,
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
    maxHeight: 200,
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
    marginTop: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#eee',
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
    flexWrap: 'wrap',
  },
  statItem: {
    marginRight: 15,
    marginBottom: 5,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  doneButtonContainer: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  doneButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    padding: 10,
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

const RepositoryItem = ({ item, onSelect }) => {
  return (
    <TouchableOpacity 
      style={styles.resultItem}
      onPress={() => onSelect(item)}
      activeOpacity={0.7}
      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
    >
      <View>
        <Text style={styles.repoName}>{item.fullName}</Text>
        {item.description && (
          <Text style={styles.repoDescription} numberOfLines={1}>
            {item.description}
          </Text>
        )}
        <View style={styles.repositoryStats}>
          <Text style={styles.statItem}>⭐ {item.stargazersCount}</Text>
          <Text style={styles.statItem}>🍴 {item.forksCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const CreateReview = () => {
  const navigate = useNavigate();
  const [createReview, { loading }] = useMutation(CREATE_REVIEW);
  const [selectedRepository, setSelectedRepository] = useState(null);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const reviewInputRef = useRef(null);
  
  const [searchRepositories] = useLazyQuery(SEARCH_REPOSITORIES, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      const repositories = data?.searchRepositories?.edges.map(edge => edge.node) || [];
      setSearchResults(repositories);
      setSearchLoading(false);
      setSearchError(null);
    },
    onError: (error) => {
      console.log('Error searching repositories:', error);
      let errorMessage = 'Failed to search repositories. Please try again.';
      if (error.message.includes('API rate limit exceeded')) {
        errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
      } else if (error.message.includes('Bad credentials')) {
        errorMessage = 'Authentication failed. Please check your GitHub token.';
      } else if (error.message.includes('NETWORK_ERROR')) {
        errorMessage = 'Network error: Unable to reach GitHub API. Please check your internet connection.';
      } else if (error.message.includes('GITHUB_API_FAILURE')) {
        errorMessage = 'GitHub API request failed. Please try again.';
      }
      setSearchError(errorMessage);
      setSearchLoading(false);
    }
  });
  
  const [debouncedSearch] = useState(() => 
    debounce((text) => {
      if (text.length >= 2) {
        setSearchLoading(true);
        setSearchError(null);
        searchRepositories({ variables: { query: text, first: 10 } });
      } else {
        setSearchResults([]);
        setSearchError(null);
      }
    }, 300)
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
      stargazersCount: repository.stargazersCount,
      forksCount: repository.forksCount,
    });
    
    // Close modal and reset search
    setSearchModalVisible(false);
    searchFormik.setFieldValue('searchTerm', '');
    
    // Dismiss keyboard after selection
    Keyboard.dismiss();
  };

  const handleSearchChange = (text) => {
    searchFormik.setFieldValue('searchTerm', text);
    debouncedSearch(text);
  };

  const clearSelectedRepository = () => {
    setSelectedRepository(null);
    reviewFormik.resetForm();
  };

  // Hide keyboard when tapping outside input
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  
  // Function to dismiss keyboard from review input
  const doneEditing = () => {
    Keyboard.dismiss();
  };

  const openSearchModal = () => {
    setSearchModalVisible(true);
    // Clear previous search
    searchFormik.setFieldValue('searchTerm', '');
    setSearchResults([]);
    setSearchError(null);
  };

  // Render repository search results in the modal
  const renderRepositoryResults = () => {
    if (searchLoading) {
      return <Text style={styles.searchHint}>Searching...</Text>;
    }
    
    if (searchError) {
      return <Text style={styles.searchError}>{searchError}</Text>;
    }
    
    if (searchResults.length === 0) {
      if (searchFormik.values.searchTerm.length >= 2) {
        return <Text style={styles.searchHint}>No repositories found</Text>;
      }
      return <Text style={styles.searchHint}>Type at least 2 characters to search</Text>;
    }
    
    return searchResults.map(item => (
      <RepositoryItem 
        key={item.id} 
        item={item} 
        onSelect={handleRepositorySelect} 
      />
    ));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.sectionTitle}>1. Find a Repository</Text>
          
          {!selectedRepository ? (
            <View style={styles.searchSection}>
              <TouchableOpacity
                style={styles.button}
                onPress={openSearchModal}
                activeOpacity={0.7}
              >
                <Text style={styles.buttonText}>Search for a Repository</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.selectedRepo}>
              <Text style={styles.repoName}>{selectedRepository.fullName}</Text>
              {selectedRepository.description && (
                <Text style={styles.repoDescription}>{selectedRepository.description}</Text>
              )}
              <View style={styles.repositoryStats}>
                <Text style={styles.statItem}>⭐ {selectedRepository.stargazersCount}</Text>
                <Text style={styles.statItem}>🍴 {selectedRepository.forksCount}</Text>
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
              returnKeyType="done"
              onSubmitEditing={dismissKeyboard}
            />
            {reviewFormik.touched.rating && reviewFormik.errors.rating && (
              <Text style={styles.errorText}>{reviewFormik.errors.rating}</Text>
            )}

            <Text style={styles.label}>Review</Text>
            <View>
              <TextInput
                ref={reviewInputRef}
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
                onFocus={() => setKeyboardVisible(true)}
                onBlur={() => setKeyboardVisible(false)}
              />
              
              {reviewInputRef.current && isKeyboardVisible && (
                <TouchableOpacity 
                  style={styles.doneButtonContainer}
                  onPress={doneEditing}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {reviewFormik.touched.text && reviewFormik.errors.text && (
              <Text style={styles.errorText}>{reviewFormik.errors.text}</Text>
            )}

            <TouchableOpacity 
              style={[styles.button, !selectedRepository && { opacity: 0.5 }]} 
              onPress={() => {
                dismissKeyboard();
                reviewFormik.handleSubmit();
              }}
              disabled={loading || !selectedRepository}
              activeOpacity={selectedRepository ? 0.7 : 1}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating review...' : 'Create review'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
      
      {/* Search Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={searchModalVisible}
        onRequestClose={() => setSearchModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Search Repositories</Text>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search repositories (min 2 characters)..."
              placeholderTextColor="#a8a8a8"
              value={searchFormik.values.searchTerm}
              onChangeText={handleSearchChange}
              autoFocus={true}
            />
            
            <ScrollView style={styles.resultsContainer}>
              {renderRepositoryResults()}
            </ScrollView>
            
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setSearchModalVisible(false)}
            >
              <Text style={styles.clearButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

module.exports = CreateReview;