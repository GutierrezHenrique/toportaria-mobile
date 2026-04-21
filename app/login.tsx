import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function Login() {
  const [email, setEmail] = useState('morador@toportaria.com');
  const [password, setPassword] = useState('123456');
  const [showPass, setShowPass] = useState(false);
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
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.root} keyboardShouldPersistTaps="handled">
        <View style={s.hero}>
          <View style={s.logo}>
            <View style={[s.logoSquare, { backgroundColor: 'rgba(255,255,255,.92)' }]} />
            <View style={[s.logoSquare, s.topRight, { backgroundColor: 'rgba(255,255,255,.62)' }]} />
            <View style={[s.logoSquare, s.bottomLeft, { backgroundColor: 'rgba(255,255,255,.62)' }]} />
            <View style={[s.logoSquare, s.bottomRight, { backgroundColor: 'white' }]} />
          </View>
          <Text style={s.brand}>ToPortaria</Text>
          <Text style={s.brandTag}>Gestão integrada de portaria</Text>
        </View>

        <View style={s.form}>
          <Text style={s.overline}>Bem-vindo de volta</Text>
          <Text style={s.title}>Entre na portaria</Text>
          <Text style={s.subtitle}>O perfil é detectado automaticamente pelo servidor.</Text>

          <Text style={s.label}>E-mail</Text>
          <TextInput
            style={s.input}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={theme.ink500}
          />

          <Text style={s.label}>Senha</Text>
          <View style={s.inputWrap}>
            <TextInput
              style={[s.input, { paddingRight: 44 }]}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor={theme.ink500}
            />
            <Pressable style={s.eye} onPress={() => setShowPass(!showPass)} hitSlop={10}>
              {showPass ? <EyeOff size={18} color={theme.ink500} /> : <Eye size={18} color={theme.ink500} />}
            </Pressable>
          </View>

          <Pressable style={[s.btn, loading && { opacity: 0.7 }]} disabled={loading} onPress={submit}>
            <Text style={s.btnText}>{loading ? 'Entrando…' : 'Entrar'}</Text>
            {!loading && <ArrowRight size={16} color="white" />}
          </Pressable>

          <View style={s.dividerRow}>
            <View style={s.divider} />
            <Text style={s.dividerText}>OU</Text>
            <View style={s.divider} />
          </View>

          <Pressable style={s.btnGhost}>
            <Text style={s.btnGhostText}>QR crachá</Text>
          </Pressable>

          <Text style={s.hint}>
            Demos: morador@toportaria.com · porteiro@toportaria.com — senha 123456
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root: { flexGrow: 1, padding: 24, paddingTop: 56, paddingBottom: 40 },
  hero: { alignItems: 'center', marginBottom: 36 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: theme.primary700,
    marginBottom: 14,
    padding: 10,
    shadowColor: theme.primary700,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  logoSquare: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 4,
    top: 10,
    left: 10,
  },
  topRight: { left: undefined, right: 10 },
  bottomLeft: { top: undefined, bottom: 10 },
  bottomRight: { top: undefined, left: undefined, right: 10, bottom: 10 },
  brand: { color: theme.ink900, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  brandTag: { color: theme.ink600, fontSize: 13, marginTop: 2 },

  form: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.ink900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 3,
  },
  overline: {
    color: theme.primary700,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { color: theme.ink900, fontSize: 26, fontWeight: '800', marginTop: 4 },
  subtitle: { color: theme.ink600, marginTop: 4, marginBottom: 22 },
  label: {
    color: theme.ink800,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    marginBottom: 6,
  },
  inputWrap: { position: 'relative' },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    color: theme.ink900,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  eye: { position: 'absolute', right: 8, top: 10, padding: 8 },
  btn: {
    backgroundColor: theme.primary600,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    flexDirection: 'row',
    gap: 6,
    shadowColor: theme.primary600,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: theme.border },
  dividerText: {
    color: theme.ink500,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  btnGhost: {
    borderWidth: 1,
    borderColor: theme.borderStrong,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: theme.surface,
  },
  btnGhostText: { color: theme.ink900, fontWeight: '700' },
  hint: { color: theme.ink500, fontSize: 12, marginTop: 18, textAlign: 'center' },
});
