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

## 🔄 Fluxo do Sistema

1. **Solicitação de Manutenção**
   - Usuário preenche formulário com detalhes do problema
   - Sistema registra informações do dispositivo e IP
   - Status inicial: 'pendente'

2. **Aprovação pelo Administrador**
   - Admin avalia a solicitação
   - Define a prioridade (alta/média/baixa)
   - Aprova ou reprova a solicitação
   - Se aprovada, aparece como "A Fazer" para os técnicos

3. **Execução pelo Técnico**
   - Técnico visualiza solicitações "A Fazer"
   - Pode iniciar a manutenção (status: 'em_andamento')
   - Pode concluir a manutenção (status: 'concluida')
   - Pode retornar para "A Fazer" se necessário

## 🛠️ Rotas da API

### Autenticação e Administração (`/admin`)
- POST `/admin/login` - Login de administrador
- POST `/admin/register` - Registro de novo administrador
- GET `/admin/profile` - Perfil do administrador
- PUT `/admin/profile` - Atualização de dados do administrador
- PATCH `/admin/solicitacoes/:id` - Aprovar/reprovar solicitação (inclui definição de prioridade)

### Técnicos (`/tecnicos`)
- GET `/tecnicos/acesso/:token` - Validar acesso do técnico
- GET `/tecnicos/manutencoes/:token` - Listar manutenções do técnico
- PATCH `/tecnicos/manutencoes/:token/:id/status` - Atualizar status da manutenção

### Solicitações (`/solicitacoes`)
- POST `/solicitacoes` - Criar nova solicitação
- GET `/solicitacoes` - Listar solicitações (com filtros)

## ⚙️ Instalação e Execução

### Pré-requisitos
- Node.js 14+
- MySQL 5.7+
- NPM ou Yarn

### Backend
1. Navegue até a pasta do backend:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o banco de dados:
   ```bash
   mysql -u root < src/database/schema.sql
   ```
4. Configure as variáveis de ambiente:
   - Copie `.env.example` para `.env`
   - Configure as variáveis:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=sistema_manutencao
     JWT_SECRET=sua_chave_secreta
     ```
5. Inicie o servidor:
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
3. Configure o arquivo de ambiente:
   - Copie `.env.example` para `.env`
   - Configure a URL da API:
     ```
     REACT_APP_API_URL=http://seu-ip:3001
     ```
4. Inicie a aplicação:
   ```bash
   npm start
   ```

## 🔒 Segurança
- Autenticação via JWT
- Senhas criptografadas com bcrypt
- CORS configurado para segurança
- Variáveis sensíveis em arquivo .env

## 📱 Funcionalidades

### Painel do Administrador
- Aprovação/reprovação de solicitações
- Definição de prioridades
- Gerenciamento de técnicos
- Visualização de todas as solicitações

### Painel do Técnico
- Visualização de manutenções por status
- Atualização de status das manutenções
- Interface intuitiva com cores por prioridade
- Informações detalhadas de cada solicitação

### Solicitação de Manutenção
- Formulário intuitivo
- Captura automática de informações do dispositivo
- Feedback imediato após envio
- Validação de campos

## 🤝 Contribuindo

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Faça commit das mudanças (`git commit -am 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nome-da-feature`)
5. Crie um Pull Request 