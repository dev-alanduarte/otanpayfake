# 💳 OtanPay - Sistema Fintech Fake

Sistema completo de fintech fake com painel administrativo para controle total de usuários e transações.

## 🚀 Características

- ✅ Sistema de login funcional
- ✅ Painel administrativo completo
- ✅ Criação e gerenciamento de usuários pelo admin
- ✅ Controle de saldos e transações
- ✅ Banco de dados SQLite (não precisa de servidor separado)
- ✅ API REST completa
- ✅ Interface moderna e responsiva

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm (geralmente vem com Node.js)

## 🔧 Instalação

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar o servidor

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

O servidor estará rodando em: `http://localhost:3000`

## 🌐 Acessos

### Login Admin (Padrão)
- **CPF:** 123.000.123-00
- **Senha:** adminOtan123#

### Login de Usuário
- Use o painel admin para criar usuários
- Faça login com o CPF e senha criados

### Recuperação de Acesso Admin
Se você perder o acesso ao admin, execute:
```bash
node scripts/recover-admin.js
```

## 📁 Estrutura do Projeto

```
├── server.js          # Servidor Express e rotas da API
├── database.js        # Configuração do banco SQLite
├── package.json       # Dependências do projeto
├── middleware/        # Middlewares de autenticação
│   └── auth.js        # Middleware JWT e autorização
├── routes/            # Rotas da API
│   ├── auth.js        # Rotas de autenticação
│   ├── admin.js       # Rotas administrativas
│   └── user.js        # Rotas do usuário
├── scripts/           # Scripts utilitários
│   └── recover-admin.js # Script de recuperação de acesso admin
├── login.html         # Página de login
├── admin-login.html   # Página de login admin
├── admin.html         # Painel administrativo
├── dashboard.html     # Dashboard do usuário
├── SECURITY.md        # Documentação de segurança
└── database.sqlite    # Banco de dados (criado automaticamente)
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login (retorna token JWT)
- `POST /api/auth/logout` - Fazer logout

### Admin (Requerem autenticação JWT + role admin)
- `GET /api/admin/users` - Listar todos os usuários
- `POST /api/admin/users` - Criar novo usuário
- `GET /api/admin/users/:cpf` - Buscar usuário específico
- `PUT /api/admin/users/:cpf` - Atualizar usuário
- `DELETE /api/admin/users/:cpf` - Deletar usuário
- `POST /api/admin/transactions` - Criar transação
- `GET /api/admin/users/:cpf/transactions` - Listar transações de um usuário
- `DELETE /api/admin/transactions/:id` - Deletar transação
- `GET /api/admin/stats` - Estatísticas gerais

**Nota:** Todas as rotas admin requerem header `Authorization: Bearer <token>`

### Usuário
- `GET /api/user/profile` - Buscar perfil do usuário logado
- `GET /api/user/transactions` - Buscar transações do usuário logado

## 🖥️ Deploy em VPS

### Passo a passo para subir no servidor:

1. **Conectar ao VPS via SSH**
   ```bash
   ssh usuario@seu-servidor.com
   ```

2. **Instalar Node.js** (se não tiver)
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clonar ou fazer upload dos arquivos**
   ```bash
   # Via Git
   git clone seu-repositorio.git
   cd otan-fintech-fake
   
   # Ou fazer upload via FTP/SFTP
   ```

4. **Instalar dependências**
   ```bash
   npm install
   ```

5. **Instalar PM2 (gerenciador de processos)**
   ```bash
   npm install -g pm2
   ```

6. **Iniciar o servidor com PM2**
   ```bash
   pm2 start server.js --name otanpay
   pm2 save
   pm2 startup
   ```

7. **Configurar Nginx (opcional, para usar porta 80)**
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

8. **Acessar**
   - Acesse: `http://seu-servidor.com` ou `http://seu-servidor.com:3000`

## 🔒 Segurança

### ✅ Melhorias de Segurança Implementadas

- ✅ **Hash de senhas** com bcrypt (salt rounds: 10)
- ✅ **Autenticação JWT** com tokens que expiram em 24h
- ✅ **Autorização por roles** (admin/user)
- ✅ **Rate limiting** para prevenir força bruta (5 tentativas/15min no login)
- ✅ **Helmet.js** para headers de segurança
- ✅ **CORS configurado** de forma restritiva
- ✅ **Validação de entrada** melhorada
- ✅ **Middleware de autenticação** protegendo todas as rotas admin

### 📋 Configuração de Produção

1. **Crie um arquivo `.env`** na raiz do projeto:
```env
PORT=3000
JWT_SECRET=sua-chave-secreta-super-segura-aqui-mude-em-producao
ALLOWED_ORIGINS=https://seudominio.com
```

2. **Mude a JWT_SECRET** para uma chave forte e única
   - Use: `openssl rand -base64 32` para gerar uma chave segura

3. **Use HTTPS** em produção (certificado SSL)

4. **Configure firewall** para limitar acesso ao servidor

⚠️ **IMPORTANTE:** Veja `SECURITY.md` para mais detalhes sobre segurança.

## 📝 Notas

- O banco de dados SQLite é criado automaticamente na primeira execução
- O usuário admin padrão é criado automaticamente
- Todos os dados são persistidos no arquivo `database.sqlite`
- Para resetar o banco, simplesmente delete o arquivo `database.sqlite`

## 🛠️ Desenvolvimento

Para desenvolvimento com auto-reload:

```bash
npm run dev
```

## 📄 Licença

Este projeto é apenas para fins educacionais e demonstração.

## 🤝 Suporte

Em caso de problemas:
1. Verifique se o Node.js está instalado: `node --version`
2. Verifique se as dependências foram instaladas: `npm list`
3. Verifique os logs do servidor no console
4. Verifique se a porta 3000 está disponível

