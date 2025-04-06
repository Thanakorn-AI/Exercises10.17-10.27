// rate-repository-app/src/components/SignIn.jsx
import React, { useState } from 'react'; 
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-native';
import * as yup from 'yup';

import Text from './Text';
import theme from '../theme';
import useSignIn from '../hooks/useSignIn';

const styles = StyleSheet.create({
  container: {
    padding: 15,
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
  button: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 5,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 5,
  },
});

const validationSchema = yup.object().shape({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required'),
});

// Export SignInContainer component specifically for tests
export const SignInContainer = ({ onSubmit }) => {
  const formik = useFormik({
    initialValues: { username: '', password: '' },
    validationSchema,
    onSubmit,
  });

  const showErrors = () => {
    return (
      formik.isSubmitting ||
      formik.values.username !== '' ||
      formik.values.password !== ''
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          showErrors() &&
            formik.touched.username &&
            formik.errors.username &&
            styles.inputError,
        ]}
        placeholder="Username"
        value={formik.values.username}
        onChangeText={formik.handleChange('username')}
        testID="usernameField"
      />
      {showErrors() && formik.touched.username && formik.errors.username && (
        <Text style={styles.errorText}>{formik.errors.username}</Text>
      )}
      <TextInput
        style={[
          styles.input,
          showErrors() &&
            formik.touched.password &&
            formik.errors.password &&
            styles.inputError,
        ]}
        placeholder="Password"
        value={formik.values.password}
        onChangeText={formik.handleChange('password')}
        secureTextEntry
        testID="passwordField"
      />
      {showErrors() && formik.touched.password && formik.errors.password && (
        <Text style={styles.errorText}>{formik.errors.password}</Text>
      )}
      {formik.status && formik.status.error && (
        <Text style={styles.errorText}>{formik.status.error}</Text>
      )}
      <Pressable 
        style={styles.button} 
        onPress={formik.handleSubmit}
        testID="submitButton"
      >
        <Text color="white" fontWeight="bold">
          Sign In
        </Text>
      </Pressable>
    </View>
  );
};

const SignIn = () => {
  const [signIn] = useSignIn();
  const navigate = useNavigate();
  const [error, setError] = useState(null); // Add state for auth error

  const onSubmit = async (values, { setSubmitting, setStatus }) => {
    const { username, password } = values;

    try {
      setError(null); // Clear previous error
      setStatus(null); // Clear previous form status
      const { data } = await signIn({ username, password });
      console.log('Authentication result:', data);
      navigate('/');
    } catch (e) {
      console.log(e);
      const errorMessage = e.message.includes('Invalid username or password')
        ? 'Invalid username or password'
        : 'An error occurred during sign-in. Please try again.';
      setError(errorMessage);
      setStatus({ error: errorMessage }); // Set form status to display the error
    } finally {
      setSubmitting(false);
    }
  };

  return <SignInContainer onSubmit={onSubmit} />;
};

export default SignIn;