import { Tabs } from 'expo-router';
import { Home, Bell, Key, User } from 'lucide-react-native';
import { theme } from '@/lib/theme';

export default function MoradorLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
        headerTitleStyle: { color: theme.ink900, fontWeight: '800' },
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.primary600,
        tabBarInactiveTintColor: theme.ink500,
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="notifications"
        options={{ title: 'Avisos', tabBarIcon: ({ color, size }) => <Bell color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="pre-auth"
        options={{ title: 'Convidar', tabBarIcon: ({ color, size }) => <Key color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
