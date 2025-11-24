# PetCare Manager

Sistema completo de gestão para pet shops focado em agendamento de banho e tosa.

## 🚀 Tecnologias

- **Next.js 15.1** (App Router) + TypeScript
- **Shadcn/ui** + Tailwind CSS
- **Prisma ORM** + PostgreSQL
- **Clerk Authentication** (multi-tenant)
- **React Hook Form** + Zod validation
- **Recharts** para gráficos
- **date-fns** para manipulação de datas

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL
- Conta no Clerk (para autenticação)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repo-url>
cd petcare-manager
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/petcare"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

4. Configure o banco de dados:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Execute o seed (opcional):
```bash
npx prisma db seed
```

6. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

## 🔧 Configuração do Clerk

1. Crie uma conta em [clerk.com](https://clerk.com)
2. Crie uma nova aplicação
3. Copie as chaves de API para o arquivo `.env`
4. Configure o webhook no Clerk apontando para: `https://seu-dominio.com/api/webhook/clerk`
5. Adicione o secret do webhook no `.env` como `WEBHOOK_SECRET`

## 📊 Funcionalidades

### Dashboard
- Métricas em tempo real (agendamentos, receita, pets atendidos, ocupação)
- Gráfico de receita dos últimos 7 dias
- Lista de próximos agendamentos
- Agendamentos pendentes de confirmação

### Agendamentos
- Calendário semanal visual
- Criação e edição de agendamentos
- Validação de conflitos de horário
- Filtros por status, profissional e serviço

### Pets
- Cadastro completo de pets
- Histórico de agendamentos
- Observações médicas e de comportamento
- Upload de fotos

### Clientes
- Cadastro com validação de CPF e telefone
- Identificação de clientes VIP
- Histórico completo de atendimentos
- Gestão de múltiplos pets por cliente

### Serviços
- Configuração de preços por porte
- Duração estimada por serviço
- Ativação/desativação de serviços

### Configurações
- Dados da organização
- Horário de funcionamento
- Gerenciamento de usuários

## 🗄️ Estrutura do Banco de Dados

O sistema utiliza PostgreSQL com Prisma ORM. As principais entidades são:

- **Organization**: Organizações (multi-tenant)
- **User**: Usuários/funcionários
- **Client**: Clientes
- **Pet**: Pets
- **Service**: Serviços oferecidos
- **Appointment**: Agendamentos

## 🔐 Segurança

- Autenticação via Clerk
- Multi-tenancy (isolamento por organização)
- Validação de dados com Zod
- Proteção de rotas com middleware

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run start` - Inicia servidor de produção
- `npm run lint` - Executa o linter
- `npx prisma migrate dev` - Executa migrações
- `npx prisma db seed` - Popula o banco com dados de exemplo

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

