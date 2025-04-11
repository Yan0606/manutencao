# Sistema de Gerenciamento de Manutenção

Este é um sistema completo para gerenciamento de manutenção, desenvolvido com uma arquitetura moderna de frontend e backend separados.

## 🚀 Tecnologias Utilizadas

### Backend
- Node.js
- Express.js
- MySQL
- JWT para autenticação
- Bcrypt para criptografia de senhas
- CORS para segurança
- Dotenv para variáveis de ambiente

### Frontend
- React.js
- TypeScript
- TailwindCSS para estilização
- React Router para navegação
- Axios para requisições HTTP
- Heroicons para ícones

## 📋 Estrutura do Projeto

O projeto está dividido em duas partes principais:

```
.
├── backend/           # API REST em Node.js
│   ├── src/
│   │   ├── routes/   # Rotas da API
│   │   └── server.js # Ponto de entrada do servidor
│   └── package.json  # Dependências do backend
│
└── frontend/         # Aplicação React
    ├── src/         # Código fonte
    └── package.json # Dependências do frontend
```

## 🔄 Rotas da API

### Autenticação e Administração (`/admin`)
- POST `/admin/login` - Login de administrador
- POST `/admin/register` - Registro de novo administrador
- GET `/admin/profile` - Perfil do administrador
- PUT `/admin/update` - Atualização de dados do administrador
- PUT `/admin/update-password` - Atualização de senha

### Técnicos (`/tecnicos`)
- GET `/tecnicos` - Lista todos os técnicos
- POST `/tecnicos` - Cria novo técnico
- PUT `/tecnicos/:id` - Atualiza dados do técnico
- DELETE `/tecnicos/:id` - Remove técnico
- GET `/tecnicos/:id` - Obtém detalhes de um técnico

### Solicitações (`/solicitacoes`)
- GET `/solicitacoes` - Lista todas as solicitações
- POST `/solicitacoes` - Cria nova solicitação
- PUT `/solicitacoes/:id` - Atualiza status da solicitação
- GET `/solicitacoes/:id` - Obtém detalhes de uma solicitação

## 🛠️ Instalação e Execução

### Backend
1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env`
   - Preencha as variáveis necessárias
4. Inicie o servidor:
   ```bash
   npm run dev
   ```

### Frontend
1. Navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Inicie a aplicação:
   ```bash
   npm start
   ```

## 🔒 Segurança
- Autenticação via JWT
- Senhas criptografadas com bcrypt
- CORS configurado para segurança
- Variáveis sensíveis em arquivo .env

## 📝 Funcionalidades
- Gerenciamento de técnicos
- Controle de solicitações de manutenção
- Sistema de autenticação para administradores
- Interface moderna e responsiva
- Dashboard administrativo

## Requisitos

- Node.js 14+ instalado
- MySQL 5.7+ instalado e rodando
- NPM ou Yarn

## Configuração do Banco de Dados

1. Crie um banco de dados MySQL
2. Execute o script SQL localizado em `backend/src/database/schema.sql`

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das mudanças (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nome-da-feature`)
5. Crie um Pull Request 