import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useAuth } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();
  return (
    <View style={s.root}>
      <View style={s.card}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{user?.name?.[0] ?? 'U'}</Text>
        </View>
        <Text style={s.name}>{user?.name}</Text>
        <Text style={s.email}>{user?.email}</Text>
        <View style={s.roleBadge}>
          <Text style={s.roleText}>{user?.role}</Text>
        </View>
      </View>
      <Pressable
        style={s.btn}
        onPress={() => {
          logout();
          router.replace('/login');
        }}
      >
        <LogOut size={16} color="white" />
        <Text style={s.btnText}>Sair da conta</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 24, paddingTop: 40 },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.primary700, fontSize: 32, fontWeight: '800' },
  name: { color: theme.ink900, fontSize: 20, fontWeight: '800', marginTop: 16 },
  email: { color: theme.ink600, marginTop: 4 },
  roleBadge: {
    backgroundColor: theme.primary50,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 12,
  },
  roleText: { color: theme.primary700, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  btn: {
    marginTop: 24,
    backgroundColor: theme.danger,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: { color: 'white', fontWeight: '700' },
});
