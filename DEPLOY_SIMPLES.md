# 🚀 Deploy Simples - OtanPay na VPS

## 📋 Passo a Passo Completo

### 1. Conectar na VPS
```bash
ssh usuario@seu-ip-ou-dominio
```

### 2. Instalar Node.js (se não tiver)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verificar instalação
```

### 3. Instalar PM2
```bash
sudo npm install -g pm2
```

### 4. Instalar Nginx
```bash
sudo apt update
sudo apt install -y nginx
```

### 5. Instalar Certbot (para SSL)
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 6. Clonar Repositório
```bash
cd /var/www
sudo git clone https://github.com/dev-alanduarte/otanpayfake.git otanpay
sudo chown -R $USER:$USER otanpay
cd otanpay
```

### 7. Instalar Dependências
```bash
npm install --production
```

### 8. Criar arquivo .env
```bash
nano .env
```
Adicione:
```
PORT=3000
NODE_ENV=production
```
Salve com `Ctrl+X`, depois `Y`, depois `Enter`

### 9. Iniciar com PM2
```bash
pm2 start server.js --name otanpay
pm2 save
pm2 startup
```
Copie e execute o comando que aparecer (algo como `sudo env PATH=...`)

### 10. Verificar se está rodando
```bash
pm2 status
pm2 logs otanpay
```

### 11. Configurar Nginx

Criar arquivo de configuração:
```bash
sudo nano /etc/nginx/sites-available/otanpay
```

Cole este conteúdo (SUBSTITUA `seu-dominio.com` pelo seu domínio real):
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Salve e saia (`Ctrl+X`, `Y`, `Enter`)

### 12. Ativar Site no Nginx
```bash
sudo ln -s /etc/nginx/sites-available/otanpay /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove site padrão
sudo nginx -t  # Testar configuração
sudo systemctl restart nginx
```

### 13. Configurar SSL (HTTPS)
```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Siga as instruções:
- Digite seu email
- Aceite os termos (A)
- Escolha redirecionar HTTP para HTTPS (2)

### 14. Configurar Firewall
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### 15. Pronto! 🎉
Acesse: `https://seu-dominio.com`

---

## 🔄 Para Atualizar (quando fizer mudanças no código)

```bash
cd /var/www/otanpay
git pull origin main
npm install --production
pm2 restart otanpay
```

## 🛠️ Comandos Úteis PM2

```bash
pm2 status              # Ver status
pm2 logs otanpay        # Ver logs em tempo real
pm2 restart otanpay     # Reiniciar aplicação
pm2 stop otanpay        # Parar aplicação
pm2 delete otanpay      # Remover da lista PM2
pm2 monit               # Monitor visual
```

## 🐛 Se algo der errado

**Aplicação não inicia:**
```bash
cd /var/www/otanpay
node server.js  # Testar manualmente
pm2 logs otanpay  # Ver erros
```

**Nginx não funciona:**
```bash
sudo nginx -t  # Testar configuração
sudo tail -f /var/log/nginx/error.log  # Ver erros
```

**SSL não funciona:**
```bash
sudo certbot certificates  # Ver certificados
sudo certbot renew --dry-run  # Testar renovação
```

