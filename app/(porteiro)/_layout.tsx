import { Tabs } from 'expo-router';
import { UserPlus, ScanLine, PackageCheck, User } from 'lucide-react-native';
import { theme } from '@/lib/theme';

export default function PorteiroLayout() {
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
        options={{
          title: 'Registrar',
          tabBarIcon: ({ color, size }) => <UserPlus color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Código',
          tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Encomendas',
          tabBarIcon: ({ color, size }) => <PackageCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
