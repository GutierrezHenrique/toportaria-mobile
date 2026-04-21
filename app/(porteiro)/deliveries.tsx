import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package } from 'lucide-react-native';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function Deliveries() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ description: '', sender: '', unitId: '' });

  const units = useQuery({
    queryKey: ['units'],
    queryFn: async () => (await api.get('/units')).data,
  });
  const list = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => (await api.get('/deliveries')).data,
  });

  const create = useMutation({
    mutationFn: async () => (await api.post('/deliveries', form)).data,
    onSuccess: () => {
      Alert.alert('Encomenda registrada', 'Morador foi notificado.');
      setForm({ description: '', sender: '', unitId: '' });
      qc.invalidateQueries({ queryKey: ['deliveries'] });
    },
  });

  const deliver = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/deliveries/${id}/deliver`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
  });

  return (
    <ScrollView style={s.root} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <View style={s.hero}>
        <View style={s.heroIcon}>
          <Package size={20} color={theme.appEntregas} />
        </View>
        <Text style={s.overline}>Encomendas</Text>
        <Text style={s.title}>Receber pacote</Text>
        <Text style={s.sub}>Vincule a encomenda à unidade de destino.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>Descrição</Text>
        <TextInput
          style={s.input}
          placeholder="Caixa pequena · Amazon"
          placeholderTextColor={theme.ink500}
          value={form.description}
          onChangeText={(t) => setForm({ ...form, description: t })}
        />
        <Text style={s.label}>Remetente</Text>
        <TextInput
          style={s.input}
          placeholder="Ex.: Mercado Livre"
          placeholderTextColor={theme.ink500}
          value={form.sender}
          onChangeText={(t) => setForm({ ...form, sender: t })}
        />
        <Text style={s.label}>Unidade</Text>
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
          style={[s.btn, (!form.description || !form.unitId) && { opacity: 0.5 }]}
          disabled={!form.description || !form.unitId}
          onPress={() => create.mutate()}
        >
          <Text style={s.btnText}>Registrar encomenda</Text>
        </Pressable>
      </View>

      <Text style={s.sectionTitle}>Recebidas recentemente</Text>
      <FlatList
        data={list.data ?? []}
        keyExtractor={(d: any) => d.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={s.rowIcon}>
              <Package size={18} color={theme.appEntregas} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{item.description}</Text>
              <Text style={s.rowSub}>
                Ap {item.unit?.number} · {item.status === 'RECEIVED' ? 'aguardando' : 'entregue'}
              </Text>
            </View>
            {item.status === 'RECEIVED' && (
              <Pressable style={s.rowBtn} onPress={() => deliver.mutate(item.id)}>
                <Text style={s.rowBtnText}>Entregar</Text>
              </Pressable>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={s.empty}>Sem encomendas.</Text>}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  hero: {
    backgroundColor: '#fff7ed',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ffedd5',
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
    color: theme.appEntregas,
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
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },

  sectionTitle: {
    color: theme.ink900,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 26,
    marginBottom: 12,
  },
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
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { color: theme.ink900, fontWeight: '700' },
  rowSub: { color: theme.ink600, fontSize: 12, marginTop: 2 },
  rowBtn: {
    backgroundColor: theme.primary600,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  rowBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
  empty: { color: theme.ink500, fontStyle: 'italic' },
});
