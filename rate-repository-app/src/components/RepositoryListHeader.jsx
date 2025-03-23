// rate-repository-app/src/components/RepositoryListHeader.jsx
const { View, StyleSheet, TextInput, Pressable } = require('react-native');
const { useState } = require('react');
const { debounce } = require('lodash');
const Text = require('./Text');
const theme = require('../theme');

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  sortSection: {
    marginBottom: 10,
  },
  sortLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  optionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  selectedOption: {
    backgroundColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'white',
  }
});

const RepositoryListHeader = ({ sortOrder, setSortOrder, searchKeyword, setSearchKeyword }) => {
  const [searchQuery, setSearchQuery] = useState(searchKeyword);

  const debouncedSearch = debounce(
    (text) => setSearchKeyword(text),
    500
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Highest rated', value: 'highest' },
    { label: 'Lowest rated', value: 'lowest' }
  ];

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search repositories..."
        value={searchQuery}
        onChangeText={handleSearch}
      />
      
      <View style={styles.sortSection}>
        <Text style={styles.sortLabel}>Sort repositories by:</Text>
        <View style={styles.optionsContainer}>
          {sortOptions.map((option) => (
            <Pressable 
              key={option.value}
              style={[
                styles.optionButton, 
                sortOrder === option.value && styles.selectedOption
              ]}
              onPress={() => setSortOrder(option.value)}
            >
              <Text 
                fontWeight={sortOrder === option.value ? 'bold' : 'normal'}
                style={[
                  styles.optionText, 
                  sortOrder === option.value && styles.selectedOptionText
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};

module.exports = RepositoryListHeader; 