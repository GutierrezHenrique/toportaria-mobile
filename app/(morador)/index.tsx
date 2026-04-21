import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { theme } from '@/lib/theme';

export default function Home() {
  const qc = useQueryClient();
  const user = useAuth((s) => s.user);
  const pending = useQuery({
    queryKey: ['my-visitors'],
    queryFn: async () => (await api.get('/visitors?status=PENDING')).data,
  });
  const deliveries = useQuery({
    queryKey: ['my-deliveries'],
    queryFn: async () => (await api.get('/deliveries')).data,
  });

  const decide = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await api.patch(`/visitors/${id}/status`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-visitors'] }),
  });

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={s.hello}>Olá, {user?.name?.split(' ')[0]} 👋</Text>
      <Text style={s.sub}>Seu condomínio na palma da mão</Text>

      <View style={s.grid}>
        <View style={s.stat}>
          <Text style={s.statN}>{pending.data?.length ?? 0}</Text>
          <Text style={s.statL}>Aguardando</Text>
        </View>
        <View style={s.stat}>
          <Text style={s.statN}>
            {(deliveries.data ?? []).filter((d: any) => d.status === 'RECEIVED').length}
          </Text>
          <Text style={s.statL}>Encomendas</Text>
        </View>
      </View>

      <Text style={s.h2}>Visitantes na portaria</Text>
      {(pending.data ?? []).length === 0 && <Text style={s.empty}>Nada pendente</Text>}
      {(pending.data ?? []).map((v: any) => (
        <View key={v.id} style={s.card}>
          <Text style={{ color: theme.ink, fontWeight: '700', fontSize: 16 }}>{v.name}</Text>
          <Text style={{ color: theme.muted, marginTop: 2 }}>
            {v.document ? `Doc: ${v.document}` : 'Sem documento'}
          </Text>
          <View style={{ flexDirection: 'row', marginTop: 14, gap: 10 }}>
            <Pressable
              style={[s.btn, { backgroundColor: theme.ok }]}
              onPress={() =>
                Alert.alert('Aprovar?', `Liberar ${v.name}?`, [
                  { text: 'Cancelar' },
                  { text: 'Aprovar', onPress: () => decide.mutate({ id: v.id, status: 'APPROVED' }) },
                ])
              }
            >
              <Text style={{ color: '#06210F', fontWeight: '700' }}>Aprovar</Text>
            </Pressable>
            <Pressable
              style={[s.btn, { backgroundColor: theme.danger }]}
              onPress={() => decide.mutate({ id: v.id, status: 'DENIED' })}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Negar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      <Text style={s.h2}>Encomendas</Text>
      {(deliveries.data ?? []).map((d: any) => (
        <View key={d.id} style={s.card}>
          <Text style={{ color: theme.ink, fontWeight: '600' }}>{d.description}</Text>
          <Text style={{ color: theme.muted, fontSize: 12 }}>
            {d.sender ? `${d.sender} • ` : ''}
            {new Date(d.receivedAt).toLocaleString('pt-BR')} • {d.status}
          </Text>
        </View>
      ))}
      {!deliveries.data?.length && <Text style={s.empty}>Sem encomendas</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hello: { color: theme.ink, fontSize: 26, fontWeight: '700' },
  sub: { color: theme.muted, marginTop: 4 },
  grid: { flexDirection: 'row', gap: 12, marginTop: 18 },
  stat: { flex: 1, backgroundColor: theme.panel, borderRadius: 16, padding: 16, borderColor: theme.border, borderWidth: 1 },
  statN: { color: theme.ink, fontSize: 28, fontWeight: '700' },
  statL: { color: theme.muted, marginTop: 4, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  h2: { color: theme.ink, fontSize: 18, fontWeight: '700', marginTop: 26, marginBottom: 10 },
  card: {
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  btn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  empty: { color: theme.muted, fontStyle: 'italic' },
});
