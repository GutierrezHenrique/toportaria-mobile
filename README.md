# ToPortaria — Mobile (Expo)

App React Native para porteiros e moradores.

## Stack
- Expo SDK 51 + Expo Router (file-based)
- React Query + Zustand + AsyncStorage
- expo-notifications (push Expo)
- expo-barcode-scanner (QR code de pré-autorização)

## Fluxos
- **Porteiro**: registrar visitante, ler QR pré-autorização, check-in/out, encomendas.
- **Morador**: home (aprovar/negar visitas), gerar códigos pré-autorização, notificações, perfil.

Login roteia automaticamente para o grupo correto (`(porteiro)` ou `(morador)`).

## Dev

```bash
cp app.json app.json.bak  # edite extra.apiUrl para IP do backend (não localhost em dispositivo físico)
npm install
npx expo start
```

Logins demo (senha `123456`):
- `porteiro@toportaria.com`
- `morador@toportaria.com`

> Em device físico, troque `apiUrl` para `http://<seu-ip-lan>:3333/api`.
