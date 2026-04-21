import { Redirect } from 'expo-router';
import { useAuth } from '@/store/auth';

export default function Index() {
  const { token, user } = useAuth();
  if (!token) return <Redirect href="/login" />;
  if (user?.role === 'PORTEIRO') return <Redirect href="/(porteiro)" />;
  return <Redirect href="/(morador)" />;
}
