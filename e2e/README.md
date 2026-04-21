# Mobile e2e (Maestro)

YAML flows executados sobre o app rodando em simulador iOS ou emulador Android. Backend precisa estar up e seed aplicado.

## Setup

```bash
# instalar Maestro
curl -Ls "https://get.maestro.mobile.dev" | bash

# backend
cd ../backend && docker compose up -d && npm run prisma:deploy && npm run prisma:seed && npm run start:dev &

# mobile (em device físico troque apiUrl em app.json para IP LAN)
cd ../mobile
npm install
npx expo run:ios   # ou run:android — precisa build nativo, não basta Expo Go
```

## Rodar flows

```bash
# um flow específico
maestro test e2e/morador-login.yaml

# todos juntos
maestro test e2e/
```

## Flows
- `morador-login.yaml` — login, home visível
- `porteiro-register-visitor.yaml` — login porteiro + formulário + chip unidade + submit
- `morador-preauth.yaml` — morador gera código pré-autorização
- `invalid-login.yaml` — senha errada exibe erro

> Maestro precisa do app buildado nativamente (bundle identifier `com.toportaria.app`). Expo Go tem outro bundle, então rode `npx expo prebuild && expo run:ios`.
