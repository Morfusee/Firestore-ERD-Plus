import { Anchor, Button, Card, Center, Container, Divider, Group, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useNavigate } from "react-router-dom";
import { GoogleButton } from "../../components/ui/SocialButtons";


function Register() {

  const navigate = useNavigate();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
    })

  return(
    <>
      <Container className="h-screen">
        <Center className="h-full">

          <Card className=" w-full max-w-md">

            <Center>
              <Title order={3}>Sign up for your account</Title>
            </Center>

            <form onSubmit={form.onSubmit((values) => console.log(values))}>
              <Stack>

                <TextInput
                  variant="filled"
                  label="Email"
                  placeholder="your@email.com"
                  key={form.key('email')}
                  {...form.getInputProps('email')}
                />

                <PasswordInput
                  variant="filled"
                  label="Password"
                  placeholder="Your password..."
                  type="password"
                  key={form.key('password')}
                  {...form.getInputProps('password')}
                />

                <Button className=" mt-2">
                  Login
                </Button>

              </Stack>
            </form>

            <Divider my="md" label="or" labelPosition="center" />

            <Stack>
              <GoogleButton>Continue with Google</GoogleButton>
            </Stack>

            <Center mt="lg">
              <Group gap='xs'>
                <Text size="sm">Have an account?</Text>
                <Anchor size="sm" onClick={() => navigate('/login')}>Login</Anchor>
              </Group>
            </Center>

          </Card>

        </Center>
      </Container>
    </>
  )
}

export default Register