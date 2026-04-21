import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function Notifications() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => (await api.get('/notifications')).data,
  });
  const markRead = useMutation({
    mutationFn: async (id: string) => (await api.patch(`/notifications/${id}/read`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <View style={s.root}>
      <FlatList
        data={list.data ?? []}
        keyExtractor={(n: any) => n.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={<Text style={s.empty}>Sem notificações</Text>}
        renderItem={({ item }) => (
          <Pressable onPress={() => !item.read && markRead.mutate(item.id)} style={[s.card, !item.read && { borderColor: theme.accent }]}>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.body}>{item.body}</Text>
            <Text style={s.when}>{new Date(item.createdAt).toLocaleString('pt-BR')}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  card: {
    backgroundColor: theme.panel,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
  },
  title: { color: theme.ink, fontWeight: '700' },
  body: { color: theme.muted, marginTop: 4 },
  when: { color: theme.muted, fontSize: 11, marginTop: 8 },
  empty: { color: theme.muted, fontStyle: 'italic', textAlign: 'center', marginTop: 40 },
});
