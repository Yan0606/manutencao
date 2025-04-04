const bcrypt = require('bcryptjs');

const senha = 'admin123';
const hash = bcrypt.hashSync(senha, 10);
console.log('Hash gerado:', hash); 