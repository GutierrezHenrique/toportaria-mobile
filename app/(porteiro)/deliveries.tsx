import { useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet, ScrollView, Alert } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function Deliveries() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ description: '', sender: '', unitId: '' });

  const units = useQuery({ queryKey: ['units'], queryFn: async () => (await api.get('/units')).data });
  const list = useQuery({ queryKey: ['deliveries'], queryFn: async () => (await api.get('/deliveries')).data });

  const create = useMutation({
    mutationFn: async () => (await api.post('/deliveries', form)).data,
    onSuccess: () => {
      Alert.alert('OK', 'Encomenda registrada');
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
      <Text style={s.h1}>Nova encomenda</Text>
      <TextInput style={s.input} placeholder="Descrição" placeholderTextColor={theme.muted} value={form.description} onChangeText={(t) => setForm({ ...form, description: t })} />
      <TextInput style={s.input} placeholder="Remetente" placeholderTextColor={theme.muted} value={form.sender} onChangeText={(t) => setForm({ ...form, sender: t })} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
        {(units.data ?? []).map((u: any) => {
          const active = form.unitId === u.id;
          return (
            <Pressable
              key={u.id}
              onPress={() => setForm({ ...form, unitId: u.id })}
              style={[s.chip, active && { backgroundColor: theme.accent, borderColor: theme.accent }]}
            >
              <Text style={{ color: active ? '#fff' : theme.ink, fontWeight: '600' }}>
                {u.block ? `${u.block}-` : ''}{u.number}
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
        <Text style={{ color: '#fff', fontWeight: '700' }}>Registrar</Text>
      </Pressable>

      <Text style={[s.h1, { marginTop: 30 }]}>Recebidas</Text>
      <FlatList
        data={list.data ?? []}
        keyExtractor={(d: any) => d.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.ink, fontWeight: '600' }}>{item.description}</Text>
              <Text style={{ color: theme.muted, fontSize: 12 }}>
                Ap {item.unit?.number} • {item.status}
              </Text>
            </View>
            {item.status === 'RECEIVED' && (
              <Pressable style={s.btnSmall} onPress={() => deliver.mutate(item.id)}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Entregar</Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  h1: { color: theme.ink, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  input: {
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.ink,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.border,
    marginRight: 8,
  },
  btn: { backgroundColor: theme.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 16 },
  card: {
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnSmall: { backgroundColor: theme.accent, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
});
