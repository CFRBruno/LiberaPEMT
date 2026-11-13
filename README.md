# LiberaPEMT

Painel Kanban de equipamentos indisponíveis (Manutenção/Inspeção) para PCM e mão de obra.

## Rodar
```bash
npm install
npm run dev      # sem .env = MODO DEMONSTRAÇÃO (pcm/pcm123 e tecnico/tecnico123)
```

## Usar com Firebase (tempo real + login real)
1. Console Firebase → criar projeto → **Authentication** (ativar "E-mail/senha") e **Firestore** (modo produção).
2. Copiar as chaves do app Web para `.env` (modelo em `.env.example`).
3. Colar `firestore.rules` em Firestore → Regras.
4. Criar os **administradores** (Bruno e Claudio) manualmente: em Authentication, adicionar `usuario@liberapemt.app` + senha; em Firestore, criar `users/<UID>` com `{ username: "bruno", nome: "Bruno", role: "pcm", admin: true, ativo: true }`. Só administradores veem a aba **Membros** e criam/editam/desativam usuários; as regras do Firestore também impõem isso.

## Como funciona
- **Planejamento**: visão Semana (Seg–Sex) ou Mês (só dias úteis), com arrastar e soltar.
- **PCM** (categoria Editor): importa (Excel ou texto colado — mesmo resultado), arrasta equipamentos para os dias, define serviços/responsáveis, marca resultado (Realizado/Adiado/Fora do prazo/Não realizado), data de realização e observações.
- **Manutenção, Pintura e Lavagem** (tipos de usuário, categoria Leitor): só leitura das tarefas do dia (atualiza em tempo real), com filtro "só as minhas".
- **Importações** nunca substituem: cada uma grava um retrato datado (`snapshots`) e atualiza por TAG; quem sai da lista vira "liberado" com data. Serviços e dias já programados são preservados.
- **Taxa de indisponibilidade** = indisponíveis ÷ frota total (meta 5%, editável). Aparece no topo para todos; o PCM atualiza a frota na aba **Frota** (com histórico).
- **Evolução**: serviços realizados por semana (Liberação, Pintura, Lavagem) e indisponíveis restantes, tendo como base a 1ª importação do mês.

Exemplos de importação em `exemplos/`.
