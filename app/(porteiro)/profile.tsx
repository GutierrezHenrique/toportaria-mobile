import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <View style={s.root}>
      <View style={s.avatar}>
        <Text style={{ color: '#fff', fontSize: 28, fontWeight: '700' }}>
          {user?.name?.[0] ?? 'U'}
        </Text>
      </View>
      <Text style={s.name}>{user?.name}</Text>
      <Text style={s.email}>{user?.email}</Text>
      <Text style={s.role}>{user?.role}</Text>
      <Pressable
        style={s.btn}
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Sair</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 24, alignItems: 'center', paddingTop: 60 },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { color: theme.ink, fontSize: 20, fontWeight: '700', marginTop: 16 },
  email: { color: theme.muted, marginTop: 4 },
  role: {
    color: theme.accent,
    marginTop: 12,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  btn: {
    marginTop: 36,
    backgroundColor: theme.danger,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
});
