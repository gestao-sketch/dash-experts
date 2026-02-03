# Dash Arca - Dashboard de Performance

Dashboard minimalista e moderno para visualização de métricas de marketing, integrado via Google Sheets API.

## Configuração Necessária (Service Account)

Como os dados são privados, utilizaremos uma **Service Account** do Google Cloud para autenticação segura.

### 1. Criar Credenciais no Google Cloud
1. Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2. Crie um novo projeto.
3. Vá em **APIs e Serviços > Biblioteca** e ative a **Google Sheets API**.
4. Vá em **APIs e Serviços > Credenciais** e clique em **Criar Credenciais > Conta de Serviço**.
5. Dê um nome (ex: `dashboard-bot`) e crie.
6. Na lista de Contas de Serviço, clique no email criado, vá na aba **Chaves** e clique em **Adicionar Chave > Criar nova chave > JSON**.
7. Um arquivo `.json` será baixado. Guarde-o com segurança.

### 2. Compartilhar a Planilha
1. Abra o arquivo JSON baixado e copie o `client_email` (ex: `dashboard-bot@projeto.iam.gserviceaccount.com`).
2. Vá na sua planilha do Google Sheets.
3. Clique em **Compartilhar** e adicione esse email como **Leitor**.

### 3. Configurar Variáveis de Ambiente
Renomeie o arquivo `.env.local.example` para `.env.local` e preencha com os dados do seu JSON:

```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL="seu-email@projeto.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY----- ... -----END PRIVATE KEY-----"
```
*Dica: Copie a chave privada inteira do JSON, incluindo os `\n`.*

### 4. Configurar Clientes
Edite `src/config/sheets.ts` com os GIDs das abas:

```typescript
export const CLIENTS = [
  {
    name: "Nome do Cliente",
    gid: "123456789", // ID da aba (veja na URL do navegador: #gid=...)
    slug: "nome-cliente",
  },
];
```

### 5. Executar o Projeto

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Estrutura do Projeto

- `src/config/sheets.ts`: Configurações de clientes.
- `src/lib/google-sheets.ts`: Conexão segura com Google API.
- `src/components/dashboard`: UI Minimalista.
