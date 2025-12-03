const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const DB_PATH = path.join(__dirname, 'database.sqlite');

// Criar conexão com o banco
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite');
        initializeDatabase();
    }
});

// Inicializar tabelas
function initializeDatabase() {
    // Tabela de usuários
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cpf TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            balance REAL DEFAULT 0,
            account_number TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela users:', err.message);
        } else {
            console.log('✅ Tabela users criada/verificada');
            // Verificar se a coluna account_number existe e adicionar se não existir
            db.all("PRAGMA table_info(users)", [], (err, columns) => {
                if (err) {
                    console.error('Erro ao verificar colunas:', err.message);
                } else {
                    const hasAccountNumber = columns.some(col => col.name === 'account_number');
                    if (!hasAccountNumber) {
                        db.run(`ALTER TABLE users ADD COLUMN account_number TEXT`, (err) => {
                            if (err) {
                                console.error('Erro ao adicionar coluna account_number:', err.message);
                            } else {
                                console.log('✅ Coluna account_number adicionada');
                            }
                        });
                    }
                }
            });
        }
    });

    // Tabela de transações
    db.run(`
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_cpf TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            icon TEXT DEFAULT '💰',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_cpf) REFERENCES users(cpf)
        )
    `, (err) => {
        if (err) {
            console.error('Erro ao criar tabela transactions:', err.message);
        } else {
            console.log('✅ Tabela transactions criada/verificada');
        }
    });

    // Criar usuário admin padrão se não existir
    db.get('SELECT * FROM users WHERE cpf = ?', ['12300012300'], (err, row) => {
        if (err) {
            console.error('Erro ao verificar admin:', err.message);
        } else if (!row) {
            db.run(
                'INSERT INTO users (cpf, name, password, balance) VALUES (?, ?, ?, ?)',
                ['12300012300', 'Admin', 'adminOtan123#', 0],
                (err) => {
                    if (err) {
                        console.error('Erro ao criar admin:', err.message);
                    } else {
                        console.log('✅ Usuário admin criado (CPF: 123.000.123-00, Senha: adminOtan123#)');
                    }
                }
            );
        }
    });
}

// Funções auxiliares do banco
const dbHelpers = {
    // Buscar usuário por CPF
    getUserByCPF: (cpf) => {
        return new Promise((resolve, reject) => {
            console.log(`🔍 Buscando usuário com CPF: ${cpf}`);
            db.get('SELECT * FROM users WHERE cpf = ?', [cpf], (err, row) => {
                if (err) {
                    console.error(`❌ Erro ao buscar usuário:`, err);
                    reject(err);
                } else {
                    if (row) {
                        console.log(`✅ Usuário encontrado: ${row.name} (CPF: ${row.cpf})`);
                    } else {
                        console.log(`❌ Nenhum usuário encontrado com CPF: ${cpf}`);
                    }
                    resolve(row);
                }
            });
        });
    },

    // Criar usuário
    createUser: (cpf, name, password, balance = 0, account_number = null) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO users (cpf, name, password, balance, account_number) VALUES (?, ?, ?, ?, ?)',
                [cpf, name, password, balance, account_number],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, cpf, name, balance, account_number });
                }
            );
        });
    },

    // Atualizar usuário
    updateUser: (cpf, updates) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];
            
            if (updates.name) {
                fields.push('name = ?');
                values.push(updates.name);
            }
            if (updates.password) {
                fields.push('password = ?');
                values.push(updates.password);
            }
            if (updates.balance !== undefined) {
                fields.push('balance = ?');
                values.push(updates.balance);
            }
            if (updates.account_number !== undefined) {
                fields.push('account_number = ?');
                values.push(updates.account_number);
            }
            
            values.push(cpf);
            
            db.run(
                `UPDATE users SET ${fields.join(', ')} WHERE cpf = ?`,
                values,
                function(err) {
                    if (err) reject(err);
                    else resolve({ changes: this.changes });
                }
            );
        });
    },

    // Deletar usuário
    deleteUser: (cpf) => {
        return new Promise((resolve, reject) => {
            // Primeiro deletar transações
            db.run('DELETE FROM transactions WHERE user_cpf = ?', [cpf], (err) => {
                if (err) {
                    reject(err);
                } else {
                    // Depois deletar usuário
                    db.run('DELETE FROM users WHERE cpf = ?', [cpf], function(err) {
                        if (err) reject(err);
                        else resolve({ changes: this.changes });
                    });
                }
            });
        });
    },

    // Listar todos os usuários
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM users ORDER BY created_at DESC', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    // Criar transação
    createTransaction: (userCPF, type, title, amount, date, icon = '💰') => {
        return new Promise((resolve, reject) => {
            // Converter formato de data se necessário (YYYY-MM-DD para DD/MM/YYYY)
            let formattedDate = date;
            if (date.includes('-') && date.length === 10) {
                const [year, month, day] = date.split('-');
                formattedDate = `${day}/${month}/${year}`;
            }
            
            db.run(
                'INSERT INTO transactions (user_cpf, type, title, amount, date, icon) VALUES (?, ?, ?, ?, ?, ?)',
                [userCPF, type, title, amount, formattedDate, icon],
                function(err) {
                    if (err) reject(err);
                    else {
                        // Atualizar saldo do usuário
                        const balanceChange = type === 'income' ? amount : -amount;
                        db.run(
                            'UPDATE users SET balance = balance + ? WHERE cpf = ?',
                            [balanceChange, userCPF],
                            (err) => {
                                if (err) reject(err);
                                else resolve({ id: this.lastID });
                            }
                        );
                    }
                }
            );
        });
    },

    // Buscar transações de um usuário
    getUserTransactions: (userCPF) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM transactions WHERE user_cpf = ? ORDER BY date DESC, created_at DESC',
                [userCPF],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    },

    // Deletar transação
    deleteTransaction: (transactionId, userCPF) => {
        return new Promise((resolve, reject) => {
            // Primeiro buscar a transação para reverter o saldo
            db.get('SELECT * FROM transactions WHERE id = ? AND user_cpf = ?', [transactionId, userCPF], (err, trans) => {
                if (err) {
                    reject(err);
                } else if (!trans) {
                    reject(new Error('Transação não encontrada'));
                } else {
                    // Reverter saldo: se era income, subtrai; se era expense, adiciona
                    const balanceChange = trans.type === 'income' ? -trans.amount : trans.amount;
                    db.run(
                        'UPDATE users SET balance = balance + ? WHERE cpf = ?',
                        [balanceChange, userCPF],
                        (err) => {
                            if (err) {
                                reject(err);
                            } else {
                                // Deletar transação
                                db.run('DELETE FROM transactions WHERE id = ?', [transactionId], function(err) {
                                    if (err) reject(err);
                                    else resolve({ changes: this.changes });
                                });
                            }
                        }
                    );
                }
            });
        });
    },

    // Estatísticas gerais
    getStats: () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT COUNT(*) as totalUsers, SUM(balance) as totalBalance FROM users', [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    db.get('SELECT COUNT(*) as totalTransactions FROM transactions', [], (err, transRow) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({
                                totalUsers: row.totalUsers || 0,
                                totalBalance: row.totalBalance || 0,
                                totalTransactions: transRow.totalTransactions || 0
                            });
                        }
                    });
                }
            });
        });
    }
};

module.exports = { db, dbHelpers };

