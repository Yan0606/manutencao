CREATE DATABASE IF NOT EXISTS sistema_manutencao;
USE sistema_manutencao;

CREATE TABLE IF NOT EXISTS solicitacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_solicitante VARCHAR(100) NOT NULL,
    setor VARCHAR(50) NOT NULL,
    titulo VARCHAR(100) NOT NULL,
    local VARCHAR(100) NOT NULL,
    descricao TEXT,
    status ENUM('pendente', 'aprovada', 'reprovada', 'em_andamento', 'concluida') DEFAULT 'pendente',
    prioridade ENUM('alta', 'media', 'baixa') DEFAULT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    dispositivo_info JSON DEFAULT NULL,
    user_agent VARCHAR(255) DEFAULT NULL,
    ip_address VARCHAR(45) DEFAULT NULL
);

-- Adicionar colunas se não existirem
ALTER TABLE solicitacoes 
ADD COLUMN IF NOT EXISTS dispositivo_info JSON DEFAULT NULL,
ADD COLUMN IF NOT EXISTS user_agent VARCHAR(255) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT NULL;

-- Atualizar ENUM de status se a tabela já existir
ALTER TABLE solicitacoes MODIFY COLUMN status 
ENUM('pendente', 'aprovada', 'reprovada', 'em_andamento', 'concluida') DEFAULT 'pendente';

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tecnicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    token VARCHAR(100) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 