# Tabacaria do Muleta

Site da Tabacaria do Muleta — catálogo, carrinho e checkout que envia o pedido
pelo WhatsApp do dono. Pedidos ficam salvos no banco até o dono encerrar.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres + Auth + Storage) · Tailwind · Vercel.

---

## 1. Configurar o Supabase

1. Crie um projeto novo em <https://supabase.com>.
2. Em **Authentication → Providers → Email**, **desative** "Confirm email"
   (a confirmação de e-mail não é exigida neste projeto).
3. Em **SQL Editor**, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql)
   e rode. Isso cria as tabelas, RLS, o bucket `products` e as policies de Storage.
4. Em **Settings → API**, copie a `Project URL` e a `anon public key`.

## 2. Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

## 3. Rodar local

```
npm install
npm run dev
```

Acesse <http://localhost:3000>.

## 4. Criar a primeira conta de admin

Não há cadastro de admin pela interface — qualquer cadastro vira `customer`
por padrão. Para promover o dono:

1. Cadastre a conta normalmente em `/cadastro`.
2. No **SQL Editor** do Supabase, rode:
   ```sql
   update public.profiles
   set role = 'admin'
   where id = (select id from auth.users where email = 'EMAIL_DO_DONO');
   ```
3. Recarregue o site logado — o menu mostra "Painel admin".

## 5. Preencher as configurações da loja

Em `/admin/configuracoes`, defina:

- Nome da loja
- WhatsApp do dono (com DDD)
- Chave Pix e nome do titular
- Frete fixo e valor para frete grátis

Depois cadastre os produtos em `/admin/produtos`.

## 6. Fluxo de um pedido

1. Cliente loga, escolhe produtos, vai pro checkout.
2. O pedido é salvo no Supabase com status `em_aberto`.
3. O site abre o WhatsApp do dono com a mensagem do pedido pré-preenchida.
4. Cliente pode acompanhar em `/meu-pedido` e clicar "Confirmar que recebi"
   (apenas marca uma flag — quem encerra é o dono).
5. Dono vê todos pedidos em `/admin`, com botões:
   - **Confirmar entrega** → status `entregue`, some da tela do cliente.
   - **Cancelar pedido** → status `cancelado`, some da tela do cliente.

## 7. Deploy na Vercel

1. Faça push do repositório no GitHub.
2. Em <https://vercel.com>, importe o repo.
3. Defina as duas variáveis de ambiente em **Settings → Environment Variables**.
4. Em **Authentication → URL Configuration** do Supabase, adicione o domínio
   final da Vercel em "Site URL" e "Redirect URLs".

## Comandos

| Comando | Para que serve |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm start` | Servir o build |
| `npm run lint` | Lint Next.js |

## Estrutura

```
src/
  app/
    page.tsx                # Home
    login/                  # Login
    cadastro/               # Cadastro (com validação 18+)
    produtos/               # Catálogo e detalhe do produto
    carrinho/               # Carrinho (localStorage)
    checkout/               # Checkout → cria pedido + abre WhatsApp
    meu-pedido/             # Pedido em aberto do cliente
    admin/                  # Painel do dono (role=admin)
      page.tsx              #   Pedidos em aberto
      produtos/             #   CRUD de produtos
      configuracoes/        #   Frete, Pix, WhatsApp
  components/               # Header, footer, cards, botões
  lib/
    supabase/               # Clients (browser, server, middleware)
    cart.ts                 # Store do carrinho em localStorage
    whatsapp.ts             # Monta mensagem e link wa.me
    types.ts                # Tipos compartilhados
supabase/
  schema.sql                # Cole no SQL Editor do Supabase
```
