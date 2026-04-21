import { FlatList, View, Text, Pressable, StyleSheet } from 'react-native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { Bell } from 'lucide-react-native';
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
      <View style={s.header}>
        <Text style={s.title}>Comunicados</Text>
        <Text style={s.sub}>Atualizações e avisos da portaria.</Text>
      </View>
      <FlatList
        data={list.data ?? []}
        keyExtractor={(n: any) => n.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListEmptyComponent={
          <View style={s.emptyHint}>
            <Text style={s.empty}>Sem notificações</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => !item.read && markRead.mutate(item.id)}
            style={[s.card, !item.read && { borderColor: theme.primary300, backgroundColor: theme.primary50 }]}
          >
            <View style={s.icon}>
              <Bell size={16} color={theme.primary700} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.cardTitle}>{item.title}</Text>
              <Text style={s.cardBody}>{item.body}</Text>
              <Text style={s.cardWhen}>{new Date(item.createdAt).toLocaleString('pt-BR')}</Text>
            </View>
            {!item.read && <View style={s.dot} />}
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  header: { padding: 20, paddingBottom: 4 },
  title: { color: theme.ink900, fontSize: 26, fontWeight: '800' },
  sub: { color: theme.ink600, marginTop: 4 },
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.primary100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: theme.ink900, fontWeight: '700' },
  cardBody: { color: theme.ink700, marginTop: 4 },
  cardWhen: { color: theme.ink500, fontSize: 11, marginTop: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary500,
    marginTop: 6,
  },
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
