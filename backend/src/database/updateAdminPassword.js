const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sistema_manutencao'
  });

  try {
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    await connection.execute(
      'UPDATE admins SET senha = ? WHERE email = ?',
      [hashedPassword, 'admin@exemplo.com']
    );
    
    console.log('Senha atualizada com sucesso!');
    // console.log('Email: admin@exemplo.com');
    // console.log('Nova senha: admin123');
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
  } finally {
    await connection.end();
  }
}

updatePassword(); 