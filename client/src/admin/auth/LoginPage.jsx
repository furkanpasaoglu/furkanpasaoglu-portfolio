import { Button, Card, Center, Stack, Text, Title } from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useMe } from './useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { data: me } = useMe();

  const from = location.state?.from?.pathname || '/admin';
  const error = searchParams.get('error');

  useEffect(() => {
    if (me) navigate(from, { replace: true });
  }, [me, from, navigate]);

  const handleLogin = () => {
    window.location.href = '/api/admin/auth/login';
  };

  return (
    <Center mih="100vh" p="md">
      <Card withBorder shadow="md" padding="xl" radius="md" w={360}>
        <Stack gap="md">
          <Title order={3} ta="center">Admin Sign in</Title>
          <Text c="dimmed" size="sm" ta="center">
            You will be redirected to Keycloak to sign in.
          </Text>
          {error && (
            <Text c="red" size="sm" ta="center">
              Sign-in error: {error}
            </Text>
          )}
          <Button
            leftSection={<IconLogin size={16} />}
            onClick={handleLogin}
            fullWidth
            mt="sm"
          >
            Continue with SSO
          </Button>
        </Stack>
      </Card>
    </Center>
  );
}
