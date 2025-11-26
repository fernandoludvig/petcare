# Variáveis de Ambiente Necessárias no Vercel

Configure as seguintes variáveis de ambiente no painel do Vercel:

## Clerk Authentication
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Chave pública do Clerk
- `CLERK_SECRET_KEY` - Chave secreta do Clerk
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` - `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` - `/sign-up`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` - `/`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` - `/`
- `NEXT_PUBLIC_APP_URL` - URL completa da aplicação (ex: https://seu-dominio.com) - usado para redirecionamento em convites
- `WEBHOOK_SECRET` - Secret do webhook do Clerk (opcional, mas recomendado)

## Database
- `DATABASE_URL` - URL de conexão do PostgreSQL (Neon)

## Como Configurar no Vercel

1. Acesse o projeto no Vercel
2. Vá em Settings > Environment Variables
3. Adicione todas as variáveis acima
4. Faça um novo deploy



