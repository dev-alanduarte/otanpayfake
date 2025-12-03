const express = require('express');
const router = express.Router();
const { dbHelpers } = require('../database');

// GET /api/admin/users - Listar todos os usuários
router.get('/users', async (req, res) => {
    try {
        const users = await dbHelpers.getAllUsers();
        res.json({ 
            success: true, 
            users 
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao listar usuários' 
        });
    }
});

// POST /api/admin/users - Criar novo usuário
router.post('/users', async (req, res) => {
    try {
        const { cpf, name, password, balance, account_number } = req.body;

        if (!cpf || !name || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'CPF, nome e senha são obrigatórios' 
            });
        }

        if (!account_number || account_number.trim() === '') {
            return res.status(400).json({ 
                success: false,
                error: 'Número da conta é obrigatório' 
            });
        }

        const cpfClean = cpf.replace(/\D/g, '');
        const initialBalance = parseFloat(balance) || 0;

        // Verificar se usuário já existe
        const existingUser = await dbHelpers.getUserByCPF(cpfClean);
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: 'CPF já cadastrado' 
            });
        }

        const user = await dbHelpers.createUser(cpfClean, name, password, initialBalance, account_number);
        res.json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao criar usuário' 
        });
    }
});

// GET /api/admin/users/:cpf - Buscar usuário específico
router.get('/users/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
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
            user 
        });
    } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar usuário' 
        });
    }
});

// PUT /api/admin/users/:cpf - Atualizar usuário
router.put('/users/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        const { name, password, balance } = req.body;
        const cpfClean = cpf.replace(/\D/g, '');

        const updates = {};
        if (name) updates.name = name;
        if (password) updates.password = password;
        if (balance !== undefined) updates.balance = parseFloat(balance);

        await dbHelpers.updateUser(cpfClean, updates);
        const user = await dbHelpers.getUserByCPF(cpfClean);
        res.json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao atualizar usuário' 
        });
    }
});

// DELETE /api/admin/users/:cpf - Deletar usuário
router.delete('/users/:cpf', async (req, res) => {
    try {
        const { cpf } = req.params;
        const cpfClean = cpf.replace(/\D/g, '');

        await dbHelpers.deleteUser(cpfClean);
        res.json({ 
            success: true, 
            message: 'Usuário deletado com sucesso' 
        });
    } catch (error) {
        console.error('Erro ao deletar usuário:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao deletar usuário' 
        });
    }
});

// GET /api/admin/users/:cpf/transactions - Listar transações de um usuário
router.get('/users/:cpf/transactions', async (req, res) => {
    try {
        const { cpf } = req.params;
        const cpfClean = cpf.replace(/\D/g, '');
        const transactions = await dbHelpers.getUserTransactions(cpfClean);
        res.json({ 
            success: true, 
            transactions 
        });
    } catch (error) {
        console.error('Erro ao listar transações:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao listar transações' 
        });
    }
});

// POST /api/admin/transactions - Criar transação
router.post('/transactions', async (req, res) => {
    try {
        const { userCPF, type, title, amount, date, icon } = req.body;

        if (!userCPF || !type || !title || !amount || !date) {
            return res.status(400).json({ 
                success: false,
                error: 'Dados incompletos' 
            });
        }

        const cpfClean = userCPF.replace(/\D/g, '');
        const transaction = await dbHelpers.createTransaction(
            cpfClean,
            type,
            title,
            parseFloat(amount),
            date,
            icon || '💰'
        );

        const user = await dbHelpers.getUserByCPF(cpfClean);
        res.json({ 
            success: true, 
            transaction, 
            user 
        });
    } catch (error) {
        console.error('Erro ao criar transação:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao criar transação' 
        });
    }
});

// DELETE /api/admin/transactions/:id - Deletar transação
router.delete('/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { userCPF } = req.query;
        
        if (!userCPF) {
            return res.status(400).json({ 
                success: false,
                error: 'userCPF é obrigatório' 
            });
        }

        const cpfClean = userCPF.replace(/\D/g, '');
        await dbHelpers.deleteTransaction(parseInt(id), cpfClean);
        res.json({ 
            success: true, 
            message: 'Transação deletada com sucesso' 
        });
    } catch (error) {
        console.error('Erro ao deletar transação:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao deletar transação' 
        });
    }
});

// GET /api/admin/stats - Estatísticas gerais
router.get('/stats', async (req, res) => {
    try {
        const stats = await dbHelpers.getStats();
        res.json({ 
            success: true, 
            stats 
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao buscar estatísticas' 
        });
    }
});

module.exports = router;

