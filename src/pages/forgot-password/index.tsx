import {
    Anchor,
    Button,
    Card,
    Center,
    Container,
    Group,
    Loader,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useUserRepo from "../../data/repo/useUserRepo";
import useAuth from "../../hooks/useAuth";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { resetPassword } = useUserRepo();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  if (loading) return null;

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (values: typeof form.values) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await resetPassword(values.email);
      if (res && res.success) {
        setSuccessMessage(
          "If an account exists for that email, a password reset link has been sent."
        );
      } else {
        setErrorMessage(res?.message || "Failed to send password reset email.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="h-screen">
      <Center className="h-full">
        <Card className=" w-full max-w-md">
          <Center>
            <Title order={3}>Reset your password</Title>
          </Center>

          <Text size="sm" mt="sm" color="dimmed">
            Enter the email associated with your account and we'll send a link to
            reset your password.
          </Text>

          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack mt="md">
              <TextInput
                variant="filled"
                label="Email"
                placeholder="your@email.com"
                {...form.getInputProps("email")}
              />

              {errorMessage && (
                <Text c="red" size="sm">
                  {errorMessage}
                </Text>
              )}

              {successMessage && (
                <Text c="teal" size="sm">
                  {successMessage}
                </Text>
              )}

              <Button type="submit" variant="filled" className=" mt-2">
                {isSubmitting ? <Loader size="sm" /> : "Send reset email"}
              </Button>

              <Group gap="sm" style={{ justifyContent: "space-between" }}>
                <Anchor size="sm" onClick={() => navigate("/login")}>Back to Login</Anchor>
                <Anchor size="sm" onClick={() => navigate("/register")}>Create account</Anchor>
              </Group>
            </Stack>
          </form>
        </Card>
      </Center>
    </Container>
  );
}

export default ForgotPasswordPage;
