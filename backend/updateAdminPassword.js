const mysql = require('mysql2/promise');

async function updatePassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_manutencao'
  });

  try {
    const password = 'admin123';
    
    await connection.execute(
      'UPDATE admins SET senha = ? WHERE email = ?',
      [password, 'admin@exemplo.com']
    );
    
    console.log('Senha atualizada com sucesso!');
    console.log('Email: admin@exemplo.com');
    console.log('Nova senha: admin123');
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
  } finally {
    await connection.end();
  }
}

updatePassword(); 