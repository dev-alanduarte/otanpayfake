/**
 * Script para Resetar Banco de Dados
 * ⚠️ ATENÇÃO: Isso vai apagar TODOS os dados!
 * Uso: node scripts/reset-database.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');
const ADMIN_CPF = '58214586480';
const ADMIN_PASSWORD = 'Mudar123#';
const ADMIN_NAME = 'Admin';

async function resetDatabase() {
    console.log('\n⚠️  RESET COMPLETO DO BANCO DE DADOS\n');
    console.log('⚠️  ATENÇÃO: Isso vai apagar TODOS os dados!\n');

    return new Promise((resolve, reject) => {
        // Fazer backup antes de apagar
        const backupPath = `${DB_PATH}.backup.${Date.now()}`;
        if (fs.existsSync(DB_PATH)) {
            console.log('📦 Criando backup...');
            fs.copyFileSync(DB_PATH, backupPath);
            console.log(`✅ Backup criado: ${backupPath}\n`);
        }

        // Fechar conexão antiga se existir
        // Deletar banco antigo
        if (fs.existsSync(DB_PATH)) {
            console.log('🗑️  Deletando banco de dados antigo...');
            fs.unlinkSync(DB_PATH);
            console.log('✅ Banco deletado\n');
        }

        // Criar novo banco
        console.log('🆕 Criando novo banco de dados...');
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Erro ao criar banco:', err.message);
                reject(err);
                return;
            }
            console.log('✅ Banco criado\n');
        });

        // Criar tabelas
        console.log('📋 Criando tabelas...');
        
        // Tabela users
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cpf TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                password TEXT NOT NULL,
                balance REAL DEFAULT 0,
                account_number TEXT,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `, (err) => {
            if (err) {
                console.error('❌ Erro ao criar tabela users:', err.message);
                db.close();
                reject(err);
                return;
            }
            console.log('✅ Tabela users criada');
        });

        // Tabela transactions
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
                console.error('❌ Erro ao criar tabela transactions:', err.message);
                db.close();
                reject(err);
                return;
            }
            console.log('✅ Tabela transactions criada\n');
        });

        // Aguardar um pouco para tabelas serem criadas
        setTimeout(async () => {
            try {
                // Criar admin
                console.log('👤 Criando admin...');
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
                
                db.run(
                    'INSERT INTO users (cpf, name, password, balance, role) VALUES (?, ?, ?, ?, ?)',
                    [ADMIN_CPF, ADMIN_NAME, hashedPassword, 0, 'admin'],
                    function(err) {
                        if (err) {
                            console.error('❌ Erro ao criar admin:', err.message);
                            db.close();
                            reject(err);
                        } else {
                            console.log('✅ Admin criado com sucesso!');
                            console.log(`   CPF: ${ADMIN_CPF}`);
                            console.log(`   Senha: ${ADMIN_PASSWORD}\n`);
                            
                            db.close();
                            console.log('✅ Banco de dados resetado com sucesso!');
                            console.log('\n📝 Credenciais do Admin:');
                            console.log(`   CPF: ${ADMIN_CPF}`);
                            console.log(`   Senha: ${ADMIN_PASSWORD}\n`);
                            resolve();
                        }
                    }
                );
            } catch (error) {
                console.error('❌ Erro:', error.message);
                db.close();
                reject(error);
            }
        }, 500);
    });
}

resetDatabase()
    .then(() => {
        console.log('✅ Processo concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    });
