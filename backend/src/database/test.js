const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function testDatabase() {
  try {
    // Testar conexão
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'sistema_manutencao'
    });

    console.log('Conexão com o banco de dados estabelecida com sucesso!');

    // Testar tabela de técnicos
    const [rows] = await connection.execute('SELECT * FROM tecnicos LIMIT 1');
    console.log('Tabela de técnicos acessível:', rows);

    await connection.end();
    console.log('Conexão encerrada');
  } catch (error) {
    console.error('Erro ao testar banco de dados:', error);
  }
}

testDatabase(); 