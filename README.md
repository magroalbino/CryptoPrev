# 💰 CryptoPrev

**CryptoPrev** é uma plataforma de previdência privada descentralizada baseada em criptomoedas. O objetivo é transformar aportes de longo prazo em rendimentos mensais previsíveis, utilizando protocolos DeFi seguros e stablecoins como DAI ou USDC. A aplicação é desenvolvida com foco em **acessibilidade, transparência e descentralização**, para usuários que desejam estabilidade financeira no mundo cripto.

---

## 🚀 Tecnologias Utilizadas

- [Next.js](https://nextjs.org/) — Framework React para frontend moderno
- [TypeScript](https://www.typescriptlang.org/) — Tipagem estática para maior segurança
- [Tailwind CSS](https://tailwindcss.com/) — Estilização rápida e responsiva
- [Firebase](https://firebase.google.com/) — Autenticação e Firestore
- [Ethers.js](https://docs.ethers.io/) — Integração com contratos inteligentes
- [WalletConnect](https://walletconnect.com/) — Conexão com carteiras Web3
- [Polygon / Arbitrum Testnet] — Blockchain para testes e execução de smart contracts
- [Superfluid (futuro)](https://www.superfluid.finance/) — Streaming de rendimentos mensais

---

## 📁 Estrutura do Projeto
```text
├── .env                     # Variáveis de ambiente (Firebase, RPC, etc)
├── .next                    # Arquivos gerados na build
├── src/                     # Código-fonte da aplicação
│   └── ...                  # Páginas, componentes e serviços
├── docs/                    # Documentações ou imagens
├── components.json          # Configurações de componentes
├── apphosting.yaml          # Configuração de deploy (Firebase Hosting)
├── tailwind.config.ts       # Estilo do projeto
├── tsconfig.json            # Configuração do TypeScript
├── next.config.ts           # Configuração do Next.js
└── README.md                # Este arquivo
```

---

## 📦 Instalação Local

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/cryptoprev.git
cd cryptoprev

# 2. Instale as dependências
npm install

# 3. Crie um arquivo .env com as variáveis necessárias
cp .env.example .env

# 4. Inicie o servidor local
npm run dev
```

---

## 🔐 Variáveis de Ambiente (.env)
Crie um arquivo .env com as seguintes chaves:

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_RPC_URL=...
NEXT_PUBLIC_CONTRACT_ADDRESS=...

---

## 📲 Funcionalidades

🔐 Login com carteira Web3 e autenticação via Firebase

💸 Depósitos em stablecoins (DAI/USDC)

⏳ Carência configurável (ex: 12 meses)

📈 Projeção de rendimentos futuros

💰 Streaming mensal (futuramente via Superfluid)

🧾 Histórico de transações e aportes

🌐 Interface amigável, acessível e bilíngue (PT/EN)

---

## 📤 Deploy
Este projeto pode ser hospedado via Firebase Hosting:

---

# Build do projeto
npm run build

# Deploy no Firebase
firebase deploy

---

## 🛠️ Em desenvolvimento
🔄 Integração com contratos inteligentes

📊 Gráficos de rendimento e histórico de performance

🔔 Notificações push sobre rendimentos

👥 Modo colaborativo (planos familiares ou grupos)

---

## 🤝 Contribuindo
Pull requests são bem-vindos! Sinta-se à vontade para abrir issues e sugerir melhorias.

---

## 📄 Licença
MIT © magroalbino

---

## 📫 Contato
Tem dúvidas ou sugestões?
📧 contato@cryptoprev.app
🐦 @CryptoPrevApp
