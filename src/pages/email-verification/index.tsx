import { Button, Center, Container, Loader, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { emailVerifiedStatusApi } from "../../data/api/authApi";

function EmailVerification() {
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const pollVerification = useCallback(async () => {
    try {
      const res = await emailVerifiedStatusApi();
      if (res.data.emailVerified) setVerified(true);
    } catch (err) {
      console.error("Polling failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    pollVerification();
    const interval = setInterval(pollVerification, 5000);
    return () => clearInterval(interval);
  }, [pollVerification]);

  useEffect(() => {
    if (verified) {
      const timer = setTimeout(() => navigate("/login"), 3000);
      return () => clearTimeout(timer);
    }
  }, [verified, navigate]);

  return (
    <Container size="xs" mt="10%">
      <Stack align="center" gap="lg">
        {!verified ? (
          <>
            <Text size="xl" fw={600}>
              Verify your email
            </Text>
            {loading && (
              <Center>
                <Loader color="blue" />
              </Center>
            )}
            <Text ta="center" c="dimmed">
              Please check your inbox and click the verification link.
            </Text>
            <Text ta="center" size="sm" c="dimmed">
              This page will detect automatically once your email is verified.
            </Text>
          </>
        ) : (
          <>
            <Text size="xl" fw={600} c="green">
              Email verified successfully
            </Text>
            <Text ta="center" size="sm" c="dimmed">
              Redirecting to the login page...
            </Text>
          </>
        )}
        <Button
          variant="filled"
          color={verified ? "green" : "blue"}
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Stack>
    </Container>
  );
}

export default EmailVerification;
