<h1 align="center">
  <img src="./src/assets/logo.svg" alt="Letmeask" width="180" />
</h1>

<p align="center">
  Plataforma de perguntas e respostas em tempo real para lives, aulas e apresentações.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-Realtime_DB-FFCA28?style=flat&logo=firebase&logoColor=black" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=flat&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white" />
</p>

---

## 📖 Sobre

O **Letmeask** permite que apresentadores criem salas de Q&A ao vivo, onde a audiência pode enviar perguntas, curtir as favoritas e responder umas às outras — tudo em tempo real via Firebase.

---

## 🚀 Stack

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 + TypeScript 5.9 |
| Build | Vite 8 |
| Roteamento | TanStack Router v1 |
| Servidor de estado | TanStack Query v5 |
| Backend / Auth | Firebase (Realtime Database + Google Auth) |
| Estilização | Tailwind CSS v4 |
| Componentes | shadcn/ui (Radix UI) |
| Ícones | Lucide React |
| Notificações | Sonner |
| Tipagem de formulários | Zod |
| Tema (dark/light) | next-themes |
| Fontes | Geist Variable |

---

## ✅ Funcionalidades

### Autenticação
- [x] Login com Google (Firebase Auth)
- [x] Logout
- [x] Tema claro / escuro persistente

### Salas
- [x] Criar nova sala
- [x] Entrar em sala via código
- [x] Encerramento de sala pelo admin (redireciona todos os participantes)

### Perguntas
- [x] Enviar perguntas (usuário autenticado)
- [x] Curtir perguntas (like/unlike em tempo real)
- [x] Destacar pergunta como sendo respondida (admin)
- [x] Marcar pergunta como respondida / em destaque (admin)
- [x] Excluir pergunta com confirmação (admin)
- [x] Loading state durante fetch das perguntas

### Community Answers *(nova funcionalidade)*
- [x] Participantes podem responder perguntas de outros usuários
- [x] Seção de respostas colapsável por pergunta (toggle por ID)
- [x] Curtir / descurtir respostas (like em tempo real)
- [x] Admin pode marcar a **melhor resposta** (exclusivo — uma por pergunta)
- [x] Melhor resposta destacada com badge dourado ⭐ e ordenada no topo
- [x] Formulário inline de resposta com avatar do usuário
- [x] Animação de entrada na lista de respostas

---

## 🗺️ Roadmap

### Em progresso
- [ ] Listagem de participantes da sala

### Planejado
- [ ] Paginação / virtualização da lista de perguntas
- [ ] Ordenação de perguntas (mais curtidas / mais recentes)
- [ ] Modo somente leitura para salas encerradas (histórico)
- [ ] Notificação em tempo real para o admin quando nova pergunta chega
- [ ] Moderação — silenciar participante da sala
- [ ] Reações emoji em perguntas (além do like)
- [ ] Exportar perguntas da sala em `.csv` / `.pdf`
- [ ] PWA / instalação mobile

---

## ⚙️ Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/LucasGabrielGit/letmeask.git
cd letmeask

# Instale as dependências
bun install   # ou npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Preencha as credenciais do Firebase no .env

# Rode o servidor de desenvolvimento
bun dev
```

Acesse `http://localhost:5173` no navegador.

---

## 🔑 Variáveis de ambiente

Crie um arquivo `.env` na raiz com as chaves do seu projeto Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 📄 Licença

Este projeto está sob a licença MIT.
