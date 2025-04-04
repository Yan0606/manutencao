# Sistema de Gerenciamento de Manutenção

Este é um sistema web completo para gerenciamento de demandas físicas de manutenção, desenvolvido com React, Node.js e MySQL.

## Estrutura do Projeto

O projeto está dividido em duas partes principais:

- `backend/`: API REST em Node.js com Express
- `frontend/`: Interface web em React com Tailwind CSS

## Requisitos

- Node.js 14+ instalado
- MySQL 5.7+ instalado e rodando
- NPM ou Yarn

## Configuração do Banco de Dados

1. Crie um banco de dados MySQL
2. Execute o script SQL localizado em `backend/src/database/schema.sql`

## Instalação e Execução

### Backend

1. Entre na pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` baseado no `.env.example`:
```bash
cp .env.example .env
```

4. Configure as variáveis de ambiente no arquivo `.env`

5. Inicie o servidor:
```bash
npm start
```

O backend estará rodando em `http://localhost:3001`

### Frontend

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

O frontend estará rodando em `http://localhost:3000`

## Funcionalidades

### Tela de Solicitação de Manutenção (Pública)
- Formulário para envio de solicitações
- Não requer autenticação
- Link para acesso do administrador

### Área do Administrador
- Login com email e senha
- Visualização de solicitações pendentes
- Aprovação/reprovação de solicitações
- Definição de prioridade
- Cadastro de técnicos de manutenção

### Área do Técnico
- Acesso via link único
- Visualização de manutenções por prioridade
- Marcação de manutenções como concluídas

## Tecnologias Utilizadas

- Frontend:
  - React
  - TypeScript
  - Tailwind CSS
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express
  - MySQL
  - JWT para autenticação
  - Bcrypt para criptografia

## Segurança

- Senhas são armazenadas com hash usando bcrypt
- Autenticação via JWT
- Tokens únicos para acesso dos técnicos
- Validação de dados em todas as requisições

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das mudanças (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nome-da-feature`)
5. Crie um Pull Request 