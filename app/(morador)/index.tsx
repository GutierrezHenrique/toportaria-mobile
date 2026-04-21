import { ScrollView, View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Users as UsersIcon, Plus, Calendar } from 'lucide-react-native';
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

  const openDeliv = (deliveries.data ?? []).filter((d: any) => d.status === 'RECEIVED').length;

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      {/* Hero */}
      <View style={s.hero}>
        <View style={s.heroBg} />
        <Text style={s.heroOverline}>Olá, {user?.name?.split(' ')[0] ?? ''} 👋</Text>
        <Text style={s.heroTitle}>
          Você tem <Text style={{ color: theme.primary700 }}>{openDeliv} encomenda{openDeliv === 1 ? '' : 's'}</Text> para retirar
        </Text>
        <Text style={s.heroSub}>
          {pending.data?.length ?? 0} visitante{pending.data?.length === 1 ? '' : 's'} aguardando aprovação.
        </Text>
        <View style={s.heroCtas}>
          <Pressable style={s.heroBtn}>
            <Package size={16} color="white" />
            <Text style={s.heroBtnText}>Ver entregas</Text>
          </Pressable>
          <Pressable style={s.heroBtnGhost}>
            <Plus size={16} color={theme.ink900} />
            <Text style={s.heroBtnGhostText}>Autorizar visita</Text>
          </Pressable>
        </View>
      </View>

      {/* Quick stats */}
      <View style={s.grid}>
        {[
          { icon: Package, label: 'Encomendas', v: String(openDeliv), sub: 'aguardando retirada', c: theme.appEntregas, bg: '#fff7ed' },
          { icon: UsersIcon, label: 'Visitantes', v: String(pending.data?.length ?? 0), sub: 'pedido de entrada', c: theme.appVisitantes, bg: '#fff1f2' },
          { icon: Calendar, label: 'Reservas', v: '—', sub: 'nada agendado', c: theme.appReservas, bg: '#f5f3ff' },
          { icon: UsersIcon, label: 'Dependentes', v: '2', sub: 'cadastrados', c: theme.primary600, bg: theme.primary50 },
        ].map((k, i) => (
          <View key={i} style={s.stat}>
            <View style={[s.statIcon, { backgroundColor: k.bg }]}>
              <k.icon size={16} color={k.c} />
            </View>
            <Text style={s.statOverline}>{k.label}</Text>
            <Text style={s.statN}>{k.v}</Text>
            <Text style={s.statSub}>{k.sub}</Text>
          </View>
        ))}
      </View>

      {/* Visitors pending */}
      <Text style={s.sectionTitle}>Visitantes na portaria</Text>
      {(pending.data ?? []).length === 0 && (
        <View style={s.emptyHint}>
          <Text style={s.empty}>Sem pedidos no momento</Text>
        </View>
      )}
      {(pending.data ?? []).map((v: any) => (
        <View key={v.id} style={s.visitorCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {v.name
                .split(' ')
                .map((w: string) => w[0])
                .slice(0, 2)
                .join('')}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.visitorName}>{v.name}</Text>
            <Text style={s.visitorMeta}>
              {v.document ?? 'sem documento'} · aguardando liberação
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Pressable
              style={s.btnApprove}
              onPress={() =>
                Alert.alert('Aprovar visita?', `Liberar ${v.name}?`, [
                  { text: 'Cancelar' },
                  { text: 'Aprovar', onPress: () => decide.mutate({ id: v.id, status: 'APPROVED' }) },
                ])
              }
            >
              <Text style={s.btnApproveText}>Aprovar</Text>
            </Pressable>
            <Pressable
              style={s.btnDeny}
              onPress={() => decide.mutate({ id: v.id, status: 'DENIED' })}
            >
              <Text style={s.btnDenyText}>Negar</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Deliveries */}
      <Text style={s.sectionTitle}>Minhas encomendas</Text>
      {(deliveries.data ?? []).slice(0, 5).map((d: any) => (
        <View key={d.id} style={s.deliveryCard}>
          <View style={s.deliveryIcon}>
            <Package size={18} color={theme.appEntregas} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.visitorName}>{d.description}</Text>
            <Text style={s.visitorMeta}>
              {d.sender ? `${d.sender} · ` : ''}
              {new Date(d.receivedAt).toLocaleString('pt-BR')}
            </Text>
          </View>
          <View
            style={[
              s.badge,
              { backgroundColor: d.status === 'DELIVERED' ? theme.successBg : theme.warningBg },
            ]}
          >
            <Text
              style={[
                s.badgeText,
                { color: d.status === 'DELIVERED' ? theme.success : theme.warning },
              ]}
            >
              {d.status === 'DELIVERED' ? 'Entregue' : 'Aguardando'}
            </Text>
          </View>
        </View>
      ))}
      {!deliveries.data?.length && (
        <View style={s.emptyHint}>
          <Text style={s.empty}>Sem encomendas</Text>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hero: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.primary50,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.primary100,
  },
  heroBg: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: theme.primary200,
    opacity: 0.4,
  },
  heroOverline: {
    color: theme.primary700,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: { color: theme.ink900, fontSize: 24, fontWeight: '800', marginTop: 4, lineHeight: 30 },
  heroSub: { color: theme.ink600, marginTop: 6 },
  heroCtas: { flexDirection: 'row', gap: 10, marginTop: 18, flexWrap: 'wrap' },
  heroBtn: {
    backgroundColor: theme.primary600,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  heroBtnGhost: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroBtnGhostText: { color: theme.ink900, fontWeight: '700', fontSize: 13 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  stat: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statOverline: {
    color: theme.ink500,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statN: { color: theme.ink900, fontSize: 22, fontWeight: '800', marginTop: 2 },
  statSub: { color: theme.ink600, fontSize: 11, marginTop: 2 },

  sectionTitle: {
    color: theme.ink900,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 26,
    marginBottom: 12,
  },
  emptyHint: {
    backgroundColor: theme.surface2,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.borderStrong,
    padding: 14,
    alignItems: 'center',
  },
  empty: { color: theme.ink500, fontStyle: 'italic' },

  visitorCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#be123c', fontWeight: '700', fontSize: 13 },
  visitorName: { color: theme.ink900, fontWeight: '700' },
  visitorMeta: { color: theme.ink600, fontSize: 12, marginTop: 2 },
  btnApprove: {
    backgroundColor: theme.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnApproveText: { color: 'white', fontWeight: '700', fontSize: 13 },
  btnDeny: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnDenyText: { color: theme.ink800, fontWeight: '700', fontSize: 13 },

  deliveryCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  deliveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
