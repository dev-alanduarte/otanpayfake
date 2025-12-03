const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// POST /api/auth/login - Fazer login
router.post('/login', async (req, res) => {
    try {
        const { cpf, password } = req.body;
        
        if (!cpf || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'CPF e senha são obrigatórios' 
            });
        }

        // Limpar CPF (remover pontos e traços)
        const cpfClean = cpf.replace(/\D/g, '');

        // Buscar usuário no banco (incluindo admin)
        const user = await dbHelpers.getUserByCPF(cpfClean);

        if (!user) {
            console.log(`❌ Usuário não encontrado para CPF: ${cpfClean}`);
            return res.status(401).json({ 
                success: false,
                error: 'CPF ou senha incorretos' 
            });
        }

        console.log(`✅ Usuário encontrado: ${user.name} (CPF: ${user.cpf})`);
        console.log(`🔐 Verificando senha...`);

        if (user.password !== password) {
            console.log(`❌ Senha incorreta. Esperada: ${user.password}, Recebida: ${password}`);
            return res.status(401).json({ 
                success: false,
                error: 'CPF ou senha incorretos' 
            });
        }

        console.log(`✅ Login bem-sucedido para: ${user.name}`);

        // Verificar se é admin (CPF do admin)
        const isAdmin = user.cpf === '12300012300';

        res.json({
            success: true,
            user: {
                cpf: user.cpf,
                name: user.name,
                balance: user.balance || 0,
                isAdmin: isAdmin
            }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno do servidor' 
        });
    }
});

// POST /api/auth/logout - Fazer logout (opcional, apenas para limpar sessão no futuro)
router.post('/logout', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Logout realizado com sucesso' 
    });
});

module.exports = router;

