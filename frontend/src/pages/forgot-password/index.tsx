import {
    Anchor,
    Button,
    Card,
    Center,
    Container,
    Group,
    Loader,
    rem,
    Stack,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useUserRepo from "../../data/repo/useUserRepo";
import useAuth from "../../hooks/useAuth";

type SubmissionDetails = {
  successMessage: string | null;
  errorMessage: string | null;
  isSubmitting: boolean;
};

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const { resetPassword } = useUserRepo();

  const defaultSubmissionDetails = {
    successMessage: null,
    errorMessage: null,
    isSubmitting: false,
  } satisfies SubmissionDetails;

  const [submissionDetails, setSubmissionDetails] = useState<SubmissionDetails>(
    defaultSubmissionDetails
  );

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
    setSubmissionDetails((prev) => ({
      ...defaultSubmissionDetails,
      isSubmitting: true,
    }));

    try {
      const res = await resetPassword(values.email);
      if (res && res.success) {
        setSubmissionDetails((prev) => ({
          ...prev,
          errorMessage: null,
          successMessage: "Password reset email sent successfully.",
        }));
      } else {
        setSubmissionDetails((prev) => ({
          ...prev,
          successMessage: null,
          errorMessage: res?.message || "Failed to send password reset email.",
        }));
      }
    } catch (err: any) {
      setSubmissionDetails((prev) => ({
        ...prev,
        successMessage: null,
        errorMessage: err?.message || "An unexpected error occurred.",
      }));
    } finally {
      setSubmissionDetails((prev) => ({
        ...prev,
        isSubmitting: false,
      }));
    }
  };

  return (
    <Container className="h-screen">
      <Center className="h-full">
        <Card className="w-full max-w-md" p={"xl"}>
          <Center>
            <Title order={3}>Forgot your password?</Title>
          </Center>

          <Text size="sm" mt="sm" c="dimmed" ta={"center"}>
            Enter your email address and we'll send you instructions to reset
            it.
          </Text>

          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <Stack mt="md">
              <TextInput
                variant="filled"
                required
                label="Email Address"
                placeholder="your@email.com"
                radius={"md"}
                {...form.getInputProps("email")}
              />

              {submissionDetails.errorMessage && (
                <Text c="red" size="sm">
                  {submissionDetails.errorMessage}
                </Text>
              )}

              {submissionDetails.successMessage && (
                <Text c={"green.7"} size="sm">
                  {submissionDetails.successMessage}
                </Text>
              )}

              <Stack gap={rem(7)}>
                <Button
                  type="submit"
                  variant="filled"
                  disabled={submissionDetails.isSubmitting}
                >
                  {submissionDetails.isSubmitting ? (
                    <Loader size="sm" />
                  ) : (
                    "Send reset email"
                  )}
                </Button>

                <Text size="xs" ta={"center"} c={"dimmed"}>
                  Check your spam folder if you don't see the email.
                </Text>
              </Stack>

              <Anchor
                size="sm"
                ml={"auto"}
                onClick={() => navigate("/login")}
                style={{ cursor: "pointer", textAlign: "center" }}
              >
                <Group gap={rem(5)} justify="flex-end">
                  <IconArrowLeft size={13} />
                  Back to Login
                </Group>
              </Anchor>
            </Stack>
          </form>
        </Card>
      </Center>
    </Container>
  );
}

export default ForgotPasswordPage;
