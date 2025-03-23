// rate-repository-app/src/components/SignUp.jsx
const { View, TextInput, Pressable, StyleSheet } = require('react-native');
const { useNavigate } = require('react-router-native');
const { useFormik } = require('formik');
const { useMutation } = require('@apollo/client');
const { CREATE_USER } = require('../graphql/queries');
const useSignIn = require('../hooks/useSignIn');
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
  username: yup
    .string()
    .required('Username is required')
    .min(5, 'Username must be at least 5 characters')
    .max(30, 'Username must be at most 30 characters'),
  password: yup
    .string()
    .required('Password is required')
    .min(5, 'Password must be at least 5 characters')
    .max(50, 'Password must be at most 50 characters'),
  passwordConfirm: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Password confirmation is required'),
});

const SignUp = () => {
  const navigate = useNavigate();
  const [createUser, { loading: createUserLoading }] = useMutation(CREATE_USER);
  const [signIn, { loading: signInLoading }] = useSignIn();

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
      passwordConfirm: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await createUser({
          variables: {
            user: {
              username: values.username,
              password: values.password,
            },
          },
        });

        // After successful registration, sign in the user
        const { data } = await signIn({
          username: values.username,
          password: values.password,
        });

        if (data) {
          navigate('/');
        }
      } catch (e) {
        console.log('Error creating user:', e);
      }
    },
  });

  const isLoading = createUserLoading || signInLoading;

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          formik.touched.username && formik.errors.username && styles.inputError,
        ]}
        placeholder="Username"
        value={formik.values.username}
        onChangeText={formik.handleChange('username')}
        onBlur={() => formik.setFieldTouched('username')}
      />
      {formik.touched.username && formik.errors.username && (
        <Text style={styles.errorText}>{formik.errors.username}</Text>
      )}

      <TextInput
        style={[
          styles.input,
          formik.touched.password && formik.errors.password && styles.inputError,
        ]}
        placeholder="Password"
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        onBlur={() => formik.setFieldTouched('password')}
        secureTextEntry
      />
      {formik.touched.password && formik.errors.password && (
        <Text style={styles.errorText}>{formik.errors.password}</Text>
      )}

      <TextInput
        style={[
          styles.input,
          formik.touched.passwordConfirm && formik.errors.passwordConfirm && styles.inputError,
        ]}
        placeholder="Password confirmation"
        value={formik.values.passwordConfirm}
        onChangeText={formik.handleChange('passwordConfirm')}
        onBlur={() => formik.setFieldTouched('passwordConfirm')}
        secureTextEntry
      />
      {formik.touched.passwordConfirm && formik.errors.passwordConfirm && (
        <Text style={styles.errorText}>{formik.errors.passwordConfirm}</Text>
      )}

      <Pressable 
        style={styles.button} 
        onPress={formik.handleSubmit}
        disabled={isLoading}
      >
        <Text color="white" fontWeight="bold">
          {isLoading ? 'Creating account...' : 'Sign up'}
        </Text>
      </Pressable>
    </View>
  );
};

module.exports = SignUp;