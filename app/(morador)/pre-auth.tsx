import { useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Key } from 'lucide-react-native';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function PreAuth() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ visitorName: '', document: '', hours: '6' });

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
      <View style={s.hero}>
        <View style={s.heroIcon}>
          <Key size={20} color={theme.appVisitantes} />
        </View>
        <Text style={s.overline}>Visitantes</Text>
        <Text style={s.title}>Anunciar visita</Text>
        <Text style={s.sub}>Gere um código que o porteiro lerá na portaria.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>Nome do visitante</Text>
        <TextInput
          style={s.input}
          placeholder="Ex.: Pedro Silva"
          placeholderTextColor={theme.ink500}
          value={form.visitorName}
          onChangeText={(t) => setForm({ ...form, visitorName: t })}
        />
        <Text style={s.label}>Documento (opcional)</Text>
        <TextInput
          style={s.input}
          placeholder="CPF ou RG"
          placeholderTextColor={theme.ink500}
          value={form.document}
          onChangeText={(t) => setForm({ ...form, document: t })}
        />
        <Text style={s.label}>Validade (horas)</Text>
        <TextInput
          style={s.input}
          placeholder="6"
          placeholderTextColor={theme.ink500}
          keyboardType="number-pad"
          value={form.hours}
          onChangeText={(t) => setForm({ ...form, hours: t })}
        />
        <Pressable
          style={[s.btn, !form.visitorName && { opacity: 0.5 }]}
          disabled={!form.visitorName}
          onPress={() => create.mutate()}
        >
          <Text style={s.btnText}>Gerar código de entrada</Text>
        </Pressable>
      </View>

      <Text style={s.sectionTitle}>Meus códigos</Text>
      {(list.data ?? []).map((p: any) => (
        <View key={p.id} style={s.codeCard}>
          <Text style={s.code}>{p.code}</Text>
          <Text style={s.codeName}>{p.visitorName}</Text>
          <Text style={s.codeMeta}>
            Válido até {new Date(p.validUntil).toLocaleString('pt-BR')}
            {p.used ? ' · USADO' : ''}
          </Text>
        </View>
      ))}
      {!list.data?.length && (
        <View style={s.emptyHint}>
          <Text style={s.empty}>Nenhum código gerado</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hero: {
    backgroundColor: '#fff1f2',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  overline: {
    color: theme.appVisitantes,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { color: theme.ink900, fontSize: 22, fontWeight: '800', marginTop: 4 },
  sub: { color: theme.ink600, marginTop: 4 },

  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
  },
  label: {
    color: theme.ink800,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    color: theme.ink900,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
  },
  btn: {
    backgroundColor: theme.primary600,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },

  sectionTitle: {
    color: theme.ink900,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 26,
    marginBottom: 12,
  },
  codeCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 16,
    marginBottom: 10,
  },
  code: { color: theme.primary600, fontSize: 24, fontWeight: '900', letterSpacing: 3 },
  codeName: { color: theme.ink900, fontWeight: '700', marginTop: 4 },
  codeMeta: { color: theme.ink600, fontSize: 12, marginTop: 2 },
  emptyHint: {
    backgroundColor: theme.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.borderStrong,
    padding: 20,
    alignItems: 'center',
  },
  empty: { color: theme.ink500, fontStyle: 'italic' },
});
