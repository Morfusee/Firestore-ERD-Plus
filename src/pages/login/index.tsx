import {
  Anchor,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { GoogleButton } from "../../components/ui/SocialButtons";
import useUserRepo from "../../data/repo/useUserRepo";
import { getErrorMessage } from "../../utils/errorHelpers";
import useAuth from "../../hooks/useAuth";

function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const navigate = useNavigate();
  const { loginUser } = useUserRepo();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (!value.trim() ? "Password is required" : null),
    },
  });

  const handleLogin = async (email: string, password: string) => {
    setIsLoggingIn(true);

    // Login the user
    const response = await loginUser(email, password);

    // Prevent the early redirecting of the user if the login fails
    if (response.success) navigate("/");
    // Show an error message if the login fails
    else
      form.setErrors({
        email: " ",
        password: getErrorMessage(response.error),
      });

    setIsLoggingIn(false);
  };

  const handleSignInWithGoogle = () => {
    // Redirect to the Google OAuth route
    window.open(
      `${import.meta.env.VITE_SERVER_URL}/auth/google/callback`,
      "_self"
    );
  };

  // Show nothing while fetching data
  if (loading) {
    return null;
  }

  // If the user is logged in already, redirect to the main page
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Container className="h-screen">
        <Center className="h-full">
          <Card className=" w-full max-w-md">
            <Center>
              <Title order={3}>Login</Title>
            </Center>

            <form
              onSubmit={form.onSubmit((values) =>
                handleLogin(values.email, values.password)
              )}
            >
              <Stack>
                <TextInput
                  variant="filled"
                  label="Email"
                  placeholder="your@email.com"
                  key={form.key("email")}
                  {...form.getInputProps("email")}
                />

                <PasswordInput
                  variant="filled"
                  label="Password"
                  placeholder="Your password..."
                  type="password"
                  key={form.key("password")}
                  {...form.getInputProps("password")}
                />

                <Button className=" mt-2" variant="filled" type="submit">
                  {isLoggingIn ? <Loader size={"sm"} /> : "Login"}
                </Button>
              </Stack>
            </form>

            <Divider my="md" label="or" labelPosition="center" />

            <Stack>
              <GoogleButton onClick={handleSignInWithGoogle}>
                Login with Google
              </GoogleButton>
            </Stack>

            <Center mt="lg">
              <Group gap="xs">
                <Text size="sm">Don't have an account?</Text>
                <Anchor size="sm" onClick={() => navigate("/register")}>
                  Sign up
                </Anchor>
              </Group>
            </Center>
          </Card>
        </Center>
      </Container>
    </>
  );
}

export default Login;
