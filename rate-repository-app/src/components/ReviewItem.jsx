// rate-repository-app/src/components/ReviewItem.jsx
const { View, StyleSheet, Pressable, Alert } = require('react-native');
const Text = require('./Text');
const theme = require('../theme');
const { format } = require('date-fns');
const { useNavigate } = require('react-router-native');
const { useMutation } = require('@apollo/client');
const { DELETE_REVIEW } = require('../graphql/queries');

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
  },
  flexRow: {
    flexDirection: 'row',
  },
  ratingContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
  },
  username: {
    marginBottom: 3,
  },
  date: {
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  viewButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
    padding: 15,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
    borderRadius: 4,
    padding: 15,
    flex: 1,
    alignItems: 'center',
  },
});

const ReviewItem = ({ review, showActions = false, onDelete }) => {
  const navigate = useNavigate();
  const [deleteReview] = useMutation(DELETE_REVIEW);

  const formattedDate = format(new Date(review.createdAt), 'dd.MM.yyyy');

  const handleViewRepository = () => {
    navigate(`/repositories/${review.repositoryId}`);
  };

  const handleDeleteReview = () => {
    Alert.alert(
      "Delete review",
      "Are you sure you want to delete this review?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              await deleteReview({ variables: { id: review.id } });
              if (onDelete) {
                onDelete();
              }
            } catch (e) {
              console.log('Error deleting review:', e);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.flexRow}>
        <View style={styles.ratingContainer}>
          <Text fontWeight="bold" color="primary">
            {review.rating}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text fontWeight="bold" style={styles.username}>
            {review.user.username}
          </Text>
          <Text color="textSecondary" style={styles.date}>
            {formattedDate}
          </Text>
          <Text>{review.text}</Text>
        </View>
      </View>
      
      {showActions && (
        <View style={styles.actionsContainer}>
          <Pressable style={styles.viewButton} onPress={handleViewRepository}>
            <Text color="white" fontWeight="bold">View repository</Text>
          </Pressable>
          <Pressable style={styles.deleteButton} onPress={handleDeleteReview}>
            <Text color="white" fontWeight="bold">Delete review</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

module.exports = ReviewItem;