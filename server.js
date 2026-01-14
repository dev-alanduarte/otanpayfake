const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { protectHTMLRoute } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de segurança
app.use(helmet({
    contentSecurityPolicy: false, // Desabilitado para permitir scripts inline nos HTMLs
    crossOriginEmbedderPolicy: false
}));

// CORS mais restritivo
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : true,
    credentials: true
}));

// Rate limiting para prevenir ataques de força bruta
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 tentativas por IP
    message: {
        success: false,
        error: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting geral para API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requisições por IP
    message: {
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.'
    }
});

app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Aplicar rate limiting nas rotas de autenticação
app.use('/api/auth/login', loginLimiter);
app.use('/api/', apiLimiter);

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname, {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
    }
}));

// ==================== ROTAS SEPARADAS ====================

// Rotas de Autenticação
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rotas do Admin
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Rotas do Usuário
const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

// Rotas sem extensão .html
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota /admin-login redireciona para /admin (compatibilidade)
app.get('/admin-login', (req, res) => {
    res.redirect('/admin');
});

// Rota /admin - mostra login se não autenticado, painel se autenticado
app.get('/admin', async (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    // Verificar se tem cookie de autenticação
    const token = req.cookies && req.cookies.authToken ? req.cookies.authToken : null;
    
    if (!token) {
        // Não autenticado - mostrar página de login
        return res.sendFile(path.join(__dirname, 'admin-login.html'));
    }
    
    try {
        // Verificar token
        const jwt = require('jsonwebtoken');
        const { JWT_SECRET } = require('./middleware/auth');
        const { dbHelpers } = require('./database');
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await dbHelpers.getUserByCPF(decoded.cpf);
        
        if (!user || (user.role || '').toLowerCase() !== 'admin') {
            // Não é admin - mostrar login
            return res.sendFile(path.join(__dirname, 'admin-login.html'));
        }
        
        // Autenticado e é admin - mostrar painel
        res.sendFile(path.join(__dirname, 'admin.html'));
    } catch (error) {
        // Token inválido - mostrar login
        res.sendFile(path.join(__dirname, 'admin-login.html'));
    }
});

app.get('/dashboard', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota catch-all para rotas não encontradas - evitar erros feios
app.get('*', (req, res) => {
    const path = req.path.toLowerCase();
    
    // Se contém "admin" na rota (ex: /adminadmin, /admin-login, etc), redirecionar para /admin
    if (path.includes('admin')) {
        return res.redirect('/admin');
    }
    
    // Para outras rotas desconhecidas, redirecionar para login
    res.redirect('/login');
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📝 Login Usuário: http://localhost:${PORT}/login`);
    console.log(`👨‍💼 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
});

