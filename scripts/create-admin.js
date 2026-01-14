/**
 * Script para Criar/Atualizar Admin
 * Uso: node scripts/create-admin.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');
const ADMIN_CPF = '58214586480';
const ADMIN_PASSWORD = 'Mudar123#';
const ADMIN_NAME = 'Admin';

async function createOrUpdateAdmin() {
    console.log('\n🔐 Criando/Atualizando Admin\n');

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Erro ao conectar ao banco:', err.message);
                reject(err);
                return;
            }
        });

        // Verificar se admin já existe
        db.get('SELECT * FROM users WHERE cpf = ?', [ADMIN_CPF], async (err, existing) => {
            if (err) {
                console.error('❌ Erro ao verificar admin:', err.message);
                db.close();
                reject(err);
                return;
            }

            try {
                const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

                if (existing) {
                    // Atualizar admin existente
                    console.log(`✅ Admin encontrado: ${existing.name} (CPF: ${existing.cpf})`);
                    console.log('🔄 Atualizando senha e role...\n');
                    
                    db.run(
                        'UPDATE users SET password = ?, role = ?, name = ? WHERE cpf = ?',
                        [hashedPassword, 'admin', ADMIN_NAME, ADMIN_CPF],
                        function(err) {
                            if (err) {
                                console.error('❌ Erro ao atualizar admin:', err.message);
                                db.close();
                                reject(err);
                            } else {
                                console.log('✅ Admin atualizado com sucesso!');
                                console.log(`   CPF: ${ADMIN_CPF}`);
                                console.log(`   Senha: ${ADMIN_PASSWORD}`);
                                db.close();
                                resolve();
                            }
                        }
                    );
                } else {
                    // Criar novo admin
                    console.log('📝 Criando novo admin...\n');
                    
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
                                console.log(`   Senha: ${ADMIN_PASSWORD}`);
                                db.close();
                                resolve();
                            }
                        }
                    );
                }
            } catch (error) {
                console.error('❌ Erro ao fazer hash da senha:', error.message);
                db.close();
                reject(error);
            }
        });
    });
}

createOrUpdateAdmin()
    .then(() => {
        console.log('\n✅ Processo concluído!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    });
