const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
    // Create a connection without specifying the database
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    try {
        // Read the schema file
        const schemaPath = path.join(__dirname, 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        // Split the schema into individual statements
        const statements = schema.split(';').filter(statement => statement.trim());

        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                } catch (error) {
                    // Ignore errors about columns already existing
                    if (!error.message.includes('Duplicate column name')) {
                        console.error('Error executing statement:', error);
                    }
                }
            }
        }

        // Create default admin user if it doesn't exist
        const adminEmail = 'admin@exemplo.com';
        const adminPassword = 'admin123';
        const hashedPassword = bcrypt.hashSync(adminPassword, 10);

        // Check if admin user already exists
        const [existingAdmins] = await connection.query(
            'SELECT * FROM sistema_manutencao.admins WHERE email = ?',
            [adminEmail]
        );

        if (existingAdmins.length === 0) {
            // Insert default admin user
            await connection.query(
                'INSERT INTO sistema_manutencao.admins (email, senha, nome) VALUES (?, ?, ?)',
                [adminEmail, hashedPassword, 'Administrador Padrão']
            );
            console.log('Usuário admin padrão criado com sucesso!');
        } else {
            console.log('Usuário admin padrão já existe.');
        }

        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
    } finally {
        await connection.end();
    }
}

module.exports = initializeDatabase; 