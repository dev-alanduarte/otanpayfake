/**
 * Script para Verificar/Criar Admin
 * Uso: node scripts/check-admin.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

async function checkAdmin() {
    console.log('\n🔍 Verificando Admin no Banco de Dados\n');

    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Erro ao conectar ao banco:', err.message);
                reject(err);
                return;
            }
        });

        // Buscar todos os admins
        db.all('SELECT * FROM users WHERE role = ?', ['admin'], (err, admins) => {
            if (err) {
                console.error('❌ Erro ao buscar admins:', err.message);
                db.close();
                reject(err);
                return;
            }

            console.log(`✅ Encontrados ${admins.length} admin(s):\n`);
            
            admins.forEach((admin, index) => {
                console.log(`Admin ${index + 1}:`);
                console.log(`   CPF: ${admin.cpf}`);
                console.log(`   Nome: ${admin.name}`);
                console.log(`   Role: ${admin.role}`);
                console.log(`   Senha hash: ${admin.password.substring(0, 20)}...`);
                console.log('');
            });

            // Verificar se existe admin com CPF 58214586480
            const targetAdmin = admins.find(a => a.cpf === '58214586480');
            
            if (targetAdmin) {
                console.log('✅ Admin com CPF 58214586480 encontrado!');
                console.log(`   Nome: ${targetAdmin.name}`);
                console.log(`   Para fazer login, use a senha que foi configurada.`);
            } else {
                console.log('❌ Admin com CPF 58214586480 NÃO encontrado!');
                console.log('\n💡 Você precisa criar ou atualizar o admin.');
                console.log('   Execute: node scripts/change-admin-cpf.js Mudar123#');
            }

            db.close();
            resolve();
        });
    });
}

checkAdmin()
    .then(() => {
        console.log('\n✅ Verificação concluída!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Erro:', error.message);
        process.exit(1);
    });
