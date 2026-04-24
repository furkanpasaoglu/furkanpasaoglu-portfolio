import { Button, Card, Center, PasswordInput, Stack, TextInput, Title, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLogin, useMe } from './useAuth';

export default function LoginPage() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: me } = useMe();
  const login = useLogin();

  const from = location.state?.from?.pathname || '/admin';

  useEffect(() => {
    if (me) navigate(from, { replace: true });
  }, [me, from, navigate]);

  const form = useForm({
    initialValues: { username: '', password: '' },
    validate: {
      username: (v) => (v.trim().length === 0 ? 'Required' : null),
      password: (v) => (v.length === 0 ? 'Required' : null),
    },
  });

  const onSubmit = async (values) => {
    setError(null);
    try {
      await login.mutateAsync(values);
      navigate(from, { replace: true });
    } catch (e) {
      setError(e.status === 401 ? 'Invalid username or password' : (e.message || 'Login failed'));
    }
  };

  return (
    <Center mih="100vh" p="md">
      <Card withBorder shadow="md" padding="xl" radius="md" w={360}>
        <Stack gap="md">
          <Title order={3} ta="center">Sign in</Title>
          {error && (
            <Alert color="red" icon={<IconAlertCircle size={16} />} variant="light">{error}</Alert>
          )}
          <form onSubmit={form.onSubmit(onSubmit)}>
            <Stack gap="sm">
              <TextInput
                label="Username"
                autoFocus
                autoComplete="username"
                {...form.getInputProps('username')}
              />
              <PasswordInput
                label="Password"
                autoComplete="current-password"
                {...form.getInputProps('password')}
              />
              <Button type="submit" loading={login.isPending} fullWidth mt="sm">
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  );
}
