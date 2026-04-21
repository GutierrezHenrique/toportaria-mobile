import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function PreAuth() {
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const [form, setForm] = useState({
    visitorName: '',
    document: '',
    hours: '6',
  });

  const list = useQuery({
    queryKey: ['pre-auth'],
    queryFn: async () => (await api.get('/pre-auth')).data,
  });

  const me = useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api.get('/auth/me')).data,
  });

  const create = useMutation({
    mutationFn: async () => {
      const validFrom = new Date();
      const validUntil = new Date(Date.now() + Number(form.hours) * 3600_000);
      const { data } = await api.post('/pre-auth', {
        visitorName: form.visitorName,
        document: form.document,
        validFrom: validFrom.toISOString(),
        validUntil: validUntil.toISOString(),
        unitId: me.data?.unitId,
      });
      return data;
    },
    onSuccess: (data: any) => {
      Alert.alert('Código gerado', `Compartilhe: ${data.code}`);
      setForm({ visitorName: '', document: '', hours: '6' });
      qc.invalidateQueries({ queryKey: ['pre-auth'] });
    },
    onError: (e: any) => Alert.alert('Erro', e?.response?.data?.message ?? 'Falha'),
  });

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={s.h1}>Pré-autorizar visita</Text>
      <Text style={s.sub}>Gere um código que o porteiro lerá na portaria</Text>

      <TextInput
        style={s.input}
        placeholder="Nome do visitante"
        placeholderTextColor={theme.muted}
        value={form.visitorName}
        onChangeText={(t) => setForm({ ...form, visitorName: t })}
      />
      <TextInput
        style={s.input}
        placeholder="Documento (opcional)"
        placeholderTextColor={theme.muted}
        value={form.document}
        onChangeText={(t) => setForm({ ...form, document: t })}
      />
      <TextInput
        style={s.input}
        placeholder="Válido por (horas)"
        placeholderTextColor={theme.muted}
        keyboardType="number-pad"
        value={form.hours}
        onChangeText={(t) => setForm({ ...form, hours: t })}
      />
      <Pressable
        style={[s.btn, !form.visitorName && { opacity: 0.5 }]}
        disabled={!form.visitorName}
        onPress={() => create.mutate()}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Gerar código</Text>
      </Pressable>

      <Text style={[s.h1, { marginTop: 28 }]}>Meus códigos</Text>
      {(list.data ?? []).map((p: any) => (
        <View key={p.id} style={s.card}>
          <Text style={s.code}>{p.code}</Text>
          <Text style={{ color: theme.ink, marginTop: 2 }}>{p.visitorName}</Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            Válido até {new Date(p.validUntil).toLocaleString('pt-BR')}
            {p.used ? ' • USADO' : ''}
          </Text>
        </View>
      ))}
      {!list.data?.length && <Text style={s.empty}>Nenhum código gerado</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  h1: { color: theme.ink, fontSize: 22, fontWeight: '700' },
  sub: { color: theme.muted, marginTop: 4, marginBottom: 16 },
  input: {
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.ink,
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  btn: { backgroundColor: theme.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 18 },
  card: { backgroundColor: theme.panel, borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 14, marginTop: 10 },
  code: { color: theme.accent, fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  empty: { color: theme.muted, fontStyle: 'italic' },
});
