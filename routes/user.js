const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// GET /api/user/profile - Buscar dados do usuário logado
router.get('/profile', async (req, res) => {
    try {
        const { cpf } = req.query;
        
        if (!cpf) {
            return res.status(400).json({ 
                success: false,
                error: 'CPF é obrigatório' 
            });
        }

        const cpfClean = cpf.replace(/\D/g, '');
        const user = await dbHelpers.getUserByCPF(cpfClean);

        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'Usuário não encontrado' 
            });
        }

        res.json({
            success: true,
            user: {
                cpf: user.cpf,
                name: user.name,
                balance: user.balance,
                account_number: user.account_number || null
            }
        });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar perfil' 
        });
    }
});

// GET /api/user/transactions - Buscar transações do usuário logado
router.get('/transactions', async (req, res) => {
    try {
        const { cpf } = req.query;
        
        if (!cpf) {
            return res.status(400).json({ 
                success: false,
                error: 'CPF é obrigatório' 
            });
        }

        const cpfClean = cpf.replace(/\D/g, '');
        const transactions = await dbHelpers.getUserTransactions(cpfClean);
        res.json({ 
            success: true, 
            transactions 
        });
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar transações' 
        });
    }
});

module.exports = router;

