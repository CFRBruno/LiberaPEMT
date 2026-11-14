# Colocar o LiberaPEMT no ar (Firebase) — passo a passo

Tempo estimado: 20–30 min. Custo: R$ 0 (plano gratuito atende ~9 usuários).
Quem faz: **Bruno**, com a conta Google que será "dona" do sistema.

## 1. Criar o projeto no Firebase
1. Acesse https://console.firebase.google.com → **Adicionar projeto** → nome `liberapemt` (pode desligar o Google Analytics).
2. **Build → Authentication → Começar → E-mail/senha → Ativar → Salvar.**
3. **Build → Firestore Database → Criar banco de dados** → local `southamerica-east1` (São Paulo) → **modo produção**.
4. **Configurações do projeto (engrenagem) → Seus apps → ícone `</>` (Web)** → apelido `liberapemt` → Registrar. Copie os 4 valores (`apiKey`, `authDomain`, `projectId`, `appId`).

## 2. Configurar o projeto no seu PC
```bash
git pull
npm install
copy .env.example .env      # no Windows (no Linux/Mac: cp .env.example .env)
```
Abra o `.env` e cole os 4 valores do passo 1.4. Depois:
```bash
npm install -g firebase-tools
firebase login
copy .firebaserc.example .firebaserc
```
Edite `.firebaserc` e troque `COLOQUE-AQUI-O-ID-DO-PROJETO` pelo `projectId`.

## 3. Publicar
```bash
npm run deploy
```
Ao final aparece o endereço (`https://SEU-PROJETO.web.app`). As regras de segurança (`firestore.rules`) vão junto.

## 4. Criar Bruno e Claudio (administradores)
1. Console Firebase → **Configurações do projeto → Contas de serviço → Gerar nova chave privada**. Salve o arquivo como `chave-servico.json` na pasta do projeto. **Nunca envie esse arquivo a ninguém nem para o Git** (ele já é ignorado).
2. Rode (troque nomes e senhas):
```bash
npm run admin -- bruno "Bruno" SUASENHA
npm run admin -- claudio "Claudio" SENHADOCLAUDIO
```
3. Apague o `chave-servico.json` depois (ou guarde em local seguro).

## 5. Primeiro acesso
Abra o endereço, entre como `bruno`, vá em **Membros** e crie os demais (PCM, Manutenção, Pintura, Lavagem). Informe a frota em **Frota** e faça a primeira **Importação**.

## Atualizações futuras
```bash
git pull && npm run deploy
```

## Observações
- Instalar no celular: abra o endereço no Chrome → menu → **Adicionar à tela inicial**.
- Troca de senha de outra pessoa não existe no site (exige função de servidor). Se alguém esquecer, o administrador pode rodar `npm run admin -- usuario "Nome" NOVASENHA` (isso redefine a senha).
- Faça uma revisão final (segurança e regras) antes de liberar para toda a equipe.
