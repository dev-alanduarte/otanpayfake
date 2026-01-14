const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');
const { generateToken } = require('../middleware/auth');

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
            return res.status(401).json({ 
                success: false,
                error: 'CPF ou senha incorretos' 
            });
        }

        // Verificar senha com bcrypt
        const isPasswordValid = await dbHelpers.verifyPassword(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false,
                error: 'CPF ou senha incorretos' 
            });
        }

        // Verificar se é admin
        const isAdmin = (user.role || '').toLowerCase() === 'admin';

        // Gerar token JWT
        const token = generateToken({
            cpf: user.cpf,
            name: user.name,
            role: user.role || 'user'
        });

        // Se for admin, salvar token em cookie HTTP-only para proteção da rota /admin
        if (isAdmin) {
            res.cookie('authToken', token, {
                httpOnly: true, // Não acessível via JavaScript (mais seguro)
                secure: process.env.NODE_ENV === 'production', // HTTPS apenas em produção
                sameSite: 'strict', // Proteção contra CSRF
                maxAge: 24 * 60 * 60 * 1000 // 24 horas
            });
        }

        res.json({
            success: true,
            token,
            user: {
                cpf: user.cpf,
                name: user.name,
                balance: user.balance || 0,
                isAdmin: isAdmin,
                role: user.role || 'user'
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

// POST /api/auth/logout - Fazer logout
router.post('/logout', (req, res) => {
    // Limpar cookie de autenticação
    res.clearCookie('authToken');
    res.json({ 
        success: true, 
        message: 'Logout realizado com sucesso' 
    });
});

module.exports = router;

