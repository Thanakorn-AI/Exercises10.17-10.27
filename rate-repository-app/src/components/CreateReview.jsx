// rate-repository-app/src/components/CreateReview.jsx
const { View, TextInput, Pressable, StyleSheet } = require('react-native');
const { useNavigate } = require('react-router-native');
const { useFormik } = require('formik');
const { useMutation } = require('@apollo/client');
const { CREATE_REVIEW } = require('../graphql/queries');
const Text = require('./Text');
const theme = require('../theme');
const yup = require('yup');

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: 'white',
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
});

const validationSchema = yup.object().shape({
  ownerName: yup.string().required('Repository owner name is required'),
  repositoryName: yup.string().required('Repository name is required'),
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

  const formik = useFormik({
    initialValues: {
      ownerName: '',
      repositoryName: '',
      rating: '',
      text: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await createReview({
          variables: {
            review: {
              repositoryName: values.repositoryName,
              ownerName: values.ownerName,
              rating: Number(values.rating),
              text: values.text,
            },
          },
        });

        const repositoryId = data.createReview.repositoryId;
        navigate(`/repositories/${repositoryId}`);
      } catch (e) {
        console.log('Error creating review:', e);
      }
    },
  });

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          formik.touched.ownerName && formik.errors.ownerName && styles.inputError,
        ]}
        placeholder="Repository owner name"
        value={formik.values.ownerName}
        onChangeText={formik.handleChange('ownerName')}
        onBlur={() => formik.setFieldTouched('ownerName')}
      />
      {formik.touched.ownerName && formik.errors.ownerName && (
        <Text style={styles.errorText}>{formik.errors.ownerName}</Text>
      )}

      <TextInput
        style={[
          styles.input,
          formik.touched.repositoryName && formik.errors.repositoryName && styles.inputError,
        ]}
        placeholder="Repository name"
        value={formik.values.repositoryName}
        onChangeText={formik.handleChange('repositoryName')}
        onBlur={() => formik.setFieldTouched('repositoryName')}
      />
      {formik.touched.repositoryName && formik.errors.repositoryName && (
        <Text style={styles.errorText}>{formik.errors.repositoryName}</Text>
      )}

      <TextInput
        style={[
          styles.input,
          formik.touched.rating && formik.errors.rating && styles.inputError,
        ]}
        placeholder="Rating between 0 and 100"
        value={formik.values.rating}
        onChangeText={formik.handleChange('rating')}
        onBlur={() => formik.setFieldTouched('rating')}
        keyboardType="numeric"
      />
      {formik.touched.rating && formik.errors.rating && (
        <Text style={styles.errorText}>{formik.errors.rating}</Text>
      )}

      <TextInput
        style={[
          styles.input,
          styles.multilineInput,
          formik.touched.text && formik.errors.text && styles.inputError,
        ]}
        placeholder="Review"
        value={formik.values.text}
        onChangeText={formik.handleChange('text')}
        onBlur={() => formik.setFieldTouched('text')}
        multiline
      />
      {formik.touched.text && formik.errors.text && (
        <Text style={styles.errorText}>{formik.errors.text}</Text>
      )}

      <Pressable 
        style={styles.button} 
        onPress={formik.handleSubmit}
        disabled={loading}
      >
        <Text color="white" fontWeight="bold">
          {loading ? 'Creating review...' : 'Create review'}
        </Text>
      </Pressable>
    </View>
  );
};

module.exports = CreateReview;