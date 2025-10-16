import { Button, Center, Container, Loader, Stack, Text } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { emailVerifiedStatusApi } from "../../data/api/authApi";
import useUserRepo from "../../data/repo/useUserRepo";

const EXPIRATION_HOURS = 24;

function EmailVerification() {
  const [verified, setVerified] = useState(false);
  const [expired, setExpired] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, logoutUser } = useUserRepo();
  const pollCount = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkExpiration = (createdAt: string) => {
    if (!createdAt) return false;
    const ageMs = Date.now() - new Date(createdAt).getTime();
    return ageMs > EXPIRATION_HOURS * 60 * 60 * 1000;
  };

  const pollVerification = useCallback(async () => {
    try {
      const res = await emailVerifiedStatusApi();

      if (user && checkExpiration(user.createdAt)) {
        setExpired(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }

      if (res.data.emailVerified) {
        setVerified(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
    } catch (err) {
      console.error("Polling failed", err);
    } finally {
      setLoading(false);
      pollCount.current += 1;
      if (pollCount.current > 60 && intervalRef.current)
        clearInterval(intervalRef.current);
    }
  }, []);

  useEffect(() => {
    pollVerification();
    intervalRef.current = setInterval(pollVerification, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
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
        {expired ? (
          <>
            <Text size="xl" fw={600} c="red">
              Email verification expired
            </Text>
            <Text ta="center" c="dimmed">
              This verification link has expired. Please register again.
            </Text>
          </>
        ) : !verified ? (
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
          onClick={() => {
            logoutUser();
            navigate("/login");
          }}
        >
          Go to Login
        </Button>
      </Stack>
    </Container>
  );
}

export default EmailVerification;
