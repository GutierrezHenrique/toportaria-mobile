import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function Login() {
  const [email, setEmail] = useState('morador@toportaria.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuth((s) => s.setAuth);
  const router = useRouter();

  async function submit() {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
      router.replace(data.user.role === 'PORTEIRO' ? '/(porteiro)' : '/(morador)');
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Falha ao entrar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <View style={s.brand}>
        <View style={s.logo}>
          <Text style={s.logoT}>T</Text>
        </View>
        <Text style={s.title}>ToPortaria</Text>
        <Text style={s.subtitle}>Entre com seu email e senha</Text>
      </View>

      <View style={s.form}>
        <Text style={s.label}>Email</Text>
        <TextInput
          style={s.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={theme.muted}
        />
        <Text style={[s.label, { marginTop: 16 }]}>Senha</Text>
        <TextInput
          style={s.input}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor={theme.muted}
        />
        <Pressable style={s.btn} disabled={loading} onPress={submit}>
          <Text style={s.btnText}>{loading ? 'Entrando…' : 'Entrar'}</Text>
        </Pressable>
        <Text style={s.hint}>
          Demos: morador@toportaria.com • porteiro@toportaria.com — senha 123456
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 24, justifyContent: 'center' },
  brand: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoT: { color: '#fff', fontSize: 32, fontWeight: '700' },
  title: { color: theme.ink, fontSize: 28, fontWeight: '700' },
  subtitle: { color: theme.muted, marginTop: 4 },
  form: {},
  label: { color: theme.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.ink,
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
  },
  btn: {
    backgroundColor: theme.accent,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  hint: { color: theme.muted, fontSize: 12, marginTop: 18, textAlign: 'center' },
});
