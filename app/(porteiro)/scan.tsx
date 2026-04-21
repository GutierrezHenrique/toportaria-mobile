import { useEffect, useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, TextInput } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { ScanLine } from 'lucide-react-native';
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
      Alert.alert('Autorizado', `Visita de ${data.name} aprovada.`);
    } catch (e: any) {
      Alert.alert('Erro', e?.response?.data?.message ?? 'Código inválido');
    } finally {
      setScanned(false);
    }
  }

  return (
    <View style={s.root}>
      <View style={s.head}>
        <View style={s.headIcon}>
          <ScanLine size={20} color={theme.primary700} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.overline}>Pré-autorização</Text>
          <Text style={s.title}>Ler código de visita</Text>
        </View>
      </View>

      <View style={s.scanner}>
        {permission === false && <Text style={s.info}>Sem permissão de câmera</Text>}
        {permission === null && <Text style={s.info}>Solicitando câmera…</Text>}
        {permission && (
          <BarCodeScanner
            style={StyleSheet.absoluteFillObject}
            onBarCodeScanned={
              scanned
                ? undefined
                : ({ data }) => {
                    setScanned(true);
                    submitCode(String(data));
                  }
            }
          />
        )}
        <View style={s.reticule} pointerEvents="none" />
      </View>

      <Text style={s.or}>OU DIGITE MANUALMENTE</Text>
      <TextInput
        style={s.input}
        placeholder="Código de 8 caracteres"
        placeholderTextColor={theme.ink500}
        autoCapitalize="characters"
        value={manualCode}
        onChangeText={setManualCode}
      />
      <Pressable
        style={[s.btn, !manualCode && { opacity: 0.5 }]}
        disabled={!manualCode}
        onPress={() => submitCode(manualCode)}
      >
        <Text style={s.btnText}>Validar código</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, padding: 20 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  headIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.primary50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overline: {
    color: theme.primary700,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { color: theme.ink900, fontSize: 22, fontWeight: '800' },
  scanner: {
    height: 320,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticule: {
    width: 220,
    height: 220,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.primary400,
    shadowColor: theme.primary400,
    shadowOpacity: 0.6,
    shadowRadius: 20,
  },
  info: { color: 'white' },
  or: {
    color: theme.ink500,
    textAlign: 'center',
    marginTop: 22,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  input: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    borderRadius: 12,
    color: theme.ink900,
    padding: 14,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 2,
    textAlign: 'center',
  },
  btn: {
    backgroundColor: theme.primary600,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: theme.primary600,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  btnText: { color: 'white', fontWeight: '700', fontSize: 15 },
});
