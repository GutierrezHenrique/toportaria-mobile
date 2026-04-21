import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Users as UsersIcon } from 'lucide-react-native';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function PorteiroRegister() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', document: '', plate: '', unitId: '' });

  const units = useQuery({
    queryKey: ['units'],
    queryFn: async () => (await api.get('/units')).data,
  });

  const pending = useQuery({
    queryKey: ['visitors', 'pending'],
    queryFn: async () => (await api.get('/visitors?status=PENDING')).data,
  });

  const register = useMutation({
    mutationFn: async () => (await api.post('/visitors', form)).data,
    onSuccess: () => {
      Alert.alert('Visitante registrado', 'Morador foi notificado para aprovar a entrada.');
      setForm({ name: '', document: '', plate: '', unitId: '' });
      qc.invalidateQueries({ queryKey: ['visitors'] });
    },
    onError: (e: any) => Alert.alert('Erro', e?.response?.data?.message ?? 'Falha'),
  });

  const checkIn = useMutation({
    mutationFn: async (id: string) =>
      (await api.patch(`/visitors/${id}/status`, { status: 'CHECKED_IN' })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['visitors'] }),
  });

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={s.hero}>
        <View style={s.heroIcon}>
          <UserPlus size={20} color={theme.primary700} />
        </View>
        <Text style={s.heroOverline}>Portaria · nova entrada</Text>
        <Text style={s.heroTitle}>Registrar visitante</Text>
        <Text style={s.heroSub}>Preencha os dados para notificar o morador.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>Nome completo</Text>
        <TextInput
          style={s.input}
          value={form.name}
          onChangeText={(t) => setForm({ ...form, name: t })}
          placeholder="João Silva"
          placeholderTextColor={theme.ink500}
        />

        <Text style={s.label}>Documento</Text>
        <TextInput
          style={s.input}
          value={form.document}
          onChangeText={(t) => setForm({ ...form, document: t })}
          placeholder="CPF ou RG"
          placeholderTextColor={theme.ink500}
        />

        <Text style={s.label}>Placa do veículo (opcional)</Text>
        <TextInput
          style={s.input}
          autoCapitalize="characters"
          value={form.plate}
          onChangeText={(t) => setForm({ ...form, plate: t.toUpperCase() })}
          placeholder="ABC1D23"
          placeholderTextColor={theme.ink500}
        />

        <Text style={s.label}>Unidade de destino</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
          {(units.data ?? []).map((u: any) => {
            const active = form.unitId === u.id;
            return (
              <Pressable
                key={u.id}
                onPress={() => setForm({ ...form, unitId: u.id })}
                style={[s.chip, active && s.chipActive]}
              >
                <Text style={[s.chipText, active && { color: 'white' }]}>
                  {u.block ? `${u.block}-` : ''}
                  {u.number}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={[s.btn, (!form.name || !form.unitId) && { opacity: 0.5 }]}
          disabled={!form.name || !form.unitId}
          onPress={() => register.mutate()}
        >
          <Text style={s.btnText}>Notificar morador</Text>
        </Pressable>
      </View>

      <View style={s.sectionHead}>
        <UsersIcon size={16} color={theme.ink700} />
        <Text style={s.sectionTitle}>Aguardando aprovação</Text>
        {(pending.data ?? []).length > 0 && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{pending.data.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={pending.data ?? []}
        keyExtractor={(v: any) => v.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {item.name
                  .split(' ')
                  .map((w: string) => w[0])
                  .slice(0, 2)
                  .join('')}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{item.name}</Text>
              <Text style={s.rowSub}>
                {item.unit?.block ? `${item.unit.block}-` : ''}
                {item.unit?.number} · aguardando
              </Text>
            </View>
            <Pressable
              style={s.rowBtn}
              onPress={() =>
                Alert.alert('Check-in', `Confirmar entrada de ${item.name}?`, [
                  { text: 'Cancelar' },
                  { text: 'Sim', onPress: () => checkIn.mutate(item.id) },
                ])
              }
            >
              <Text style={s.rowBtnText}>Entrada</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>Nada pendente</Text>}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hero: {
    backgroundColor: theme.primary50,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.primary100,
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
  heroOverline: {
    color: theme.primary700,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  heroTitle: { color: theme.ink900, fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroSub: { color: theme.ink600, marginTop: 4 },

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
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: theme.ink900, borderColor: theme.ink900 },
  chipText: { color: theme.ink800, fontWeight: '700', fontSize: 13 },
  btn: {
    backgroundColor: theme.primary600,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: theme.primary600,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },

  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28, marginBottom: 12 },
  sectionTitle: { color: theme.ink900, fontSize: 17, fontWeight: '800', flex: 1 },
  badge: {
    backgroundColor: theme.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: { color: theme.danger, fontSize: 11, fontWeight: '700' },

  row: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: theme.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.primary700, fontWeight: '700', fontSize: 13 },
  rowTitle: { color: theme.ink900, fontWeight: '700', fontSize: 14 },
  rowSub: { color: theme.ink600, fontSize: 12, marginTop: 2 },
  rowBtn: {
    backgroundColor: theme.primary600,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rowBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  empty: { color: theme.ink500, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
});
