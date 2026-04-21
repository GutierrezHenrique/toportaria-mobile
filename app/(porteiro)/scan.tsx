import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, TextInput } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { api } from '@/lib/api';
import { theme } from '@/lib/theme';

export default function Scan() {
  const [permission, setPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    BarCodeScanner.requestPermissionsAsync().then(({ status }) =>
      setPermission(status === 'granted'),
    );
  }, []);

  async function submitCode(code: string) {
    try {
      const { data } = await api.post('/visitors/code', { code });
      Alert.alert('Autorizado', `Visita de ${data.name} aprovada`);
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Código inválido');
    } finally {
      setScanned(false);
    }
  }

  return (
    <View style={s.root}>
      <Text style={s.h1}>Validar código de visita</Text>

      <View style={s.scanner}>
        {permission === false && <Text style={s.info}>Sem permissão de câmera</Text>}
        {permission === null && <Text style={s.info}>Solicitando câmera…</Text>}
        {permission && (
          <BarCodeScanner
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={scanned ? undefined : ({ data }) => {
              setScanned(true);
              submitCode(String(data));
            }}
          />
        )}
      </View>

      <Text style={s.or}>ou digite manualmente</Text>
      <TextInput
        style={s.input}
        placeholder="Código"
        placeholderTextColor={theme.muted}
        autoCapitalize="characters"
        value={manualCode}
        onChangeText={setManualCode}
      />
      <Pressable
        style={[s.btn, !manualCode && { opacity: 0.5 }]}
        disabled={!manualCode}
        onPress={() => submitCode(manualCode)}
      >
        <Text style={{ color: '#fff', fontWeight: '700' }}>Validar</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  h1: { color: theme.ink, fontSize: 22, fontWeight: '700', marginBottom: 12 },
  scanner: {
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: theme.panel2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { color: theme.muted },
  or: { color: theme.muted, textAlign: 'center', marginVertical: 16 },
  input: {
    backgroundColor: theme.panel2,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    color: theme.ink,
    padding: 14,
  },
  btn: { backgroundColor: theme.accent, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 12 },
});
