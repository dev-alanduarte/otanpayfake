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
- **CPF:** 000.000.000-00
- **Senha:** admin123

### Login de Usuário
- Use o painel admin para criar usuários
- Faça login com o CPF e senha criados

## 📁 Estrutura do Projeto

```
├── server.js          # Servidor Express e rotas da API
├── database.js        # Configuração do banco SQLite
├── package.json       # Dependências do projeto
├── login.html         # Página de login
├── admin.html         # Painel administrativo
├── dashboard.html     # Dashboard do usuário
└── database.sqlite    # Banco de dados (criado automaticamente)
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/login` - Fazer login

### Admin
- `GET /api/admin/users` - Listar todos os usuários
- `POST /api/admin/users` - Criar novo usuário
- `PUT /api/admin/users/:cpf` - Atualizar usuário
- `DELETE /api/admin/users/:cpf` - Deletar usuário
- `POST /api/admin/transactions` - Criar transação
- `GET /api/admin/users/:cpf/transactions` - Listar transações de um usuário
- `DELETE /api/admin/transactions/:id` - Deletar transação
- `GET /api/admin/stats` - Estatísticas gerais

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

⚠️ **IMPORTANTE:** Este é um sistema fake para demonstração. Para produção, considere:

- Usar HTTPS
- Implementar autenticação JWT
- Criptografar senhas com bcrypt (já incluído)
- Validar e sanitizar todas as entradas
- Implementar rate limiting
- Usar variáveis de ambiente para configurações sensíveis

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

