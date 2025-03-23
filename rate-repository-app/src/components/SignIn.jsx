// rate-repository-app/src/components/SignIn.jsx
const { View, TextInput, Pressable, StyleSheet } = require("react-native");
const { useFormik } = require("formik");
const { useNavigate } = require("react-router-native");

const Text = require("./Text");
const theme = require("../theme");
const yup = require("yup");
const useSignIn = require("../hooks/useSignIn");

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
    alignItems: "center",
    marginVertical: 5,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 5,
  },
});

const validationSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

const SignInForm = ({ onSubmit }) => {
  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema,
    onSubmit,
  });

  const showErrors = () => {
    return (
      formik.isSubmitting ||
      formik.values.username !== "" ||
      formik.values.password !== ""
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
        onChangeText={formik.handleChange("username")}
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
        onChangeText={formik.handleChange("password")}
        secureTextEntry
      />
      {showErrors() && formik.touched.password && formik.errors.password && (
        <Text style={styles.errorText}>{formik.errors.password}</Text>
      )}
      <Pressable style={styles.button} onPress={formik.handleSubmit}>
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

  const onSubmit = async (values) => {
    const { username, password } = values;

    try {
      const { data } = await signIn({ username, password });
      console.log("Authentication result:", data); // This should show the access token
      navigate("/"); // Redirect to repositories list
    } catch (e) {
      console.log(e);
    }
  };

  return <SignInForm onSubmit={onSubmit} />;
};

module.exports = SignIn;
