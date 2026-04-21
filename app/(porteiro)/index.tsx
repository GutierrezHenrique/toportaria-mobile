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
      Alert.alert('OK', 'Visitante registrado, morador notificado');
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
      <Text style={s.h1}>Novo visitante</Text>

      <Text style={s.label}>Nome</Text>
      <TextInput
        style={s.input}
        value={form.name}
        onChangeText={(t) => setForm({ ...form, name: t })}
      />

      <Text style={s.label}>Documento</Text>
      <TextInput
        style={s.input}
        value={form.document}
        onChangeText={(t) => setForm({ ...form, document: t })}
      />

      <Text style={s.label}>Placa (opcional)</Text>
      <TextInput
        style={s.input}
        autoCapitalize="characters"
        value={form.plate}
        onChangeText={(t) => setForm({ ...form, plate: t.toUpperCase() })}
      />

      <Text style={s.label}>Unidade</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
        {(units.data ?? []).map((u: any) => {
          const active = form.unitId === u.id;
          return (
            <Pressable
              key={u.id}
              onPress={() => setForm({ ...form, unitId: u.id })}
              style={[s.chip, active && { backgroundColor: theme.accent, borderColor: theme.accent }]}
            >
              <Text style={{ color: active ? '#fff' : theme.ink, fontWeight: '600' }}>
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
        <Text style={s.btnText}>Registrar e notificar morador</Text>
      </Pressable>

      <Text style={[s.h1, { marginTop: 32 }]}>Aguardando aprovação</Text>
      <FlatList
        data={pending.data ?? []}
        keyExtractor={(v: any) => v.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.ink, fontWeight: '600' }}>{item.name}</Text>
              <Text style={{ color: theme.muted, fontSize: 12 }}>
                {item.unit?.block ? `Bl ${item.unit.block} • ` : ''}Ap {item.unit?.number}
              </Text>
            </View>
            <Pressable
              style={s.btnSmall}
              onPress={() =>
                Alert.alert('Check-in', `Confirmar entrada de ${item.name}?`, [
                  { text: 'Cancelar' },
                  { text: 'Sim', onPress: () => checkIn.mutate(item.id) },
                ])
              }
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>Entrada</Text>
            </Pressable>
          </View>
        )}
        ListEmptyComponent={<Text style={{ color: theme.muted }}>Nada pendente</Text>}
      />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  h1: { color: theme.ink, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  label: { color: theme.muted, fontSize: 12, textTransform: 'uppercase', marginTop: 14, letterSpacing: 1 },
  input: {
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.border,
    color: theme.ink,
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
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
  btn: {
    backgroundColor: theme.accent,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnSmall: {
    backgroundColor: theme.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
});
