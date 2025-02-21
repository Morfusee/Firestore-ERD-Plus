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
import { Navigate, useNavigate } from "react-router-dom";
import { GoogleButton } from "../../components/ui/SocialButtons";
import useUserRepo from "../../data/repo/useUserRepo";
import useAuth from "../../hooks/useAuth";
import { useState } from "react";

function Register() {
  const [isRegistering, setIsRegistering] = useState(false);

  const { registerUser } = useUserRepo();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validate: {
      username: (value) => {
        if (!value.trim()) {
          return "Username is required";
        }

        if (value.trim().length < 8 || value.trim().length > 20) {
          return "Username must be between 8 and 20 characters";
        }

        return null;
      },
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => {
        if (!value.trim()) {
          return "Password is required";
        }

        if (value.length < 8) {
          return "Password must be at least 8 characters long";
        }

        if (!/[A-Z]/.test(value)) {
          return "Password must contain at least one uppercase letter";
        }

        if (!/[a-z]/.test(value)) {
          return "Password must contain at least one lowercase letter";
        }

        if (!/[0-9]/.test(value)) {
          return "Password must contain at least one number";
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
          return "Password must contain at least one special character";
        }

        return null;
      },
    },
  });

  const handleSignUp = async (
    username: string,
    email: string,
    password: string
  ) => {
    setIsRegistering(true);

    // Register the user
    await registerUser(username, email, password)
      .then((status) => {
        if (status) navigate("/");
        setIsRegistering(false);
      })
      .catch(() => {
        setIsRegistering(false);
      });
  };

  const handleContinueWithGoogle = () => {
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
              <Title order={3}>Sign up for your account</Title>
            </Center>

            <form
              onSubmit={form.onSubmit((values) =>
                handleSignUp(values.username, values.email, values.password)
              )}
            >
              <Stack>
                <TextInput
                  variant="filled"
                  label="Username"
                  placeholder="John Doe"
                  key={form.key("username")}
                  {...form.getInputProps("username")}
                />

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
                  {isRegistering ? <Loader size={"sm"} /> : "Sign up"}
                </Button>
              </Stack>
            </form>

            <Divider my="md" label="or" labelPosition="center" />

            <Stack>
              <GoogleButton onClick={handleContinueWithGoogle}>
                Continue with Google
              </GoogleButton>
            </Stack>

            <Center mt="lg">
              <Group gap="xs">
                <Text size="sm">Have an account?</Text>
                <Anchor size="sm" onClick={() => navigate("/login")}>
                  Login
                </Anchor>
              </Group>
            </Center>
          </Card>
        </Center>
      </Container>
    </>
  );
}

export default Register;
