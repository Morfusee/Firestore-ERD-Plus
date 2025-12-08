import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
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
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton";
import { getErrorMessage } from "../../utils/errorHelpers";

function Login() {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { signInWithEmailAndPassword, loading } = useFirebaseAuth();

  const navigate = useNavigate();

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      username: "",
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

    try {
      // Login the user
      const user = await signInWithEmailAndPassword(email, password);

      // Prevent the early redirecting of the user if the login fails
      if (user) {
        navigate({
          to: "/",
        });
      }

      setIsLoggingIn(false);
    } catch (err) {
      setIsLoggingIn(false);
      const message = getErrorMessage(err);
      form.setErrors({
        email: " ",
        password: message,
      });
    }
  };

  // Show nothing while fetching data
  if (loading) {
    return null;
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

                <Group gap="xs" justify="flex-end">
                  <Anchor
                    size="sm"
                    onClick={() =>
                      navigate({
                        to: "/forgot-password",
                      })
                    }
                  >
                    Forgot password?
                  </Anchor>
                </Group>

                <Button variant="filled" type="submit">
                  {isLoggingIn ? <Loader size={"sm"} /> : "Login"}
                </Button>
              </Stack>
            </form>

            <Divider my="md" label="or" labelPosition="center" />

            <Stack>
              <GoogleSignInButton />
            </Stack>

            <Center mt="lg">
              <Group gap="xs">
                <Text size="sm">Don't have an account?</Text>
                <Anchor
                  size="sm"
                  onClick={() =>
                    navigate({
                      to: "/register",
                    })
                  }
                >
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
