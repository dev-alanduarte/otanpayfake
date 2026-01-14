const jwt = require('jsonwebtoken');
const { dbHelpers } = require('../database');

// Chave secreta para JWT (em produção, usar variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'otan-fintech-secret-key-change-in-production-2024';

// Middleware para verificar autenticação (apenas cookie HTTP-only)
const authenticate = async (req, res, next) => {
    try {
        // Apenas verificar cookie HTTP-only (mais seguro)
        const token = req.cookies && req.cookies.authToken ? req.cookies.authToken : null;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticação não fornecido'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Buscar usuário no banco
        const user = await dbHelpers.getUserByCPF(decoded.cpf);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Usuário não encontrado'
            });
        }

        // Adicionar dados do usuário à requisição
        req.user = {
            cpf: user.cpf,
            name: user.name,
            role: user.role || 'user'
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token inválido ou expirado'
            });
        }
        
        console.error('Erro na autenticação:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
};

// Middleware para verificar se é admin
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            error: 'Acesso negado. Apenas administradores podem acessar esta rota.'
        });
    }
};

// Gerar token JWT
const generateToken = (user) => {
    return jwt.sign(
        {
            cpf: user.cpf,
            name: user.name,
            role: user.role || 'user'
        },
        JWT_SECRET,
        { expiresIn: '24h' } // Token expira em 24 horas
    );
};

// Middleware para proteger rotas HTML (apenas cookie HTTP-only)
const protectHTMLRoute = async (req, res, next) => {
    try {
        // Apenas verificar cookie HTTP-only (mais seguro)
        const token = req.cookies && req.cookies.authToken ? req.cookies.authToken : null;

        if (!token) {
            return res.redirect('/admin');
        }

        // Verificar token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Buscar usuário no banco
        const user = await dbHelpers.getUserByCPF(decoded.cpf);
        
        if (!user) {
            return res.redirect('/admin');
        }

        // Verificar se é admin
        if ((user.role || '').toLowerCase() !== 'admin') {
            return res.redirect('/admin');
        }

        // Adicionar dados do usuário à requisição
        req.user = {
            cpf: user.cpf,
            name: user.name,
            role: user.role || 'user'
        };

        next();
    } catch (error) {
        // Token inválido ou expirado - redirecionar para /admin (que mostrará login)
        return res.redirect('/admin');
    }
};

module.exports = {
    authenticate,
    requireAdmin,
    generateToken,
    protectHTMLRoute,
    JWT_SECRET
};
