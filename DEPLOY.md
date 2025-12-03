# 🚀 Guia de Deploy - OtanPay para VPS

Este guia vai te ajudar a colocar o OtanPay online em uma VPS com HTTPS e domínio.

## 📋 Pré-requisitos

1. **VPS** (Ubuntu 20.04 ou superior recomendado)
2. **Domínio** apontado para o IP da VPS
3. **Acesso SSH** à VPS
4. **Usuário com permissões sudo**

## 🔧 Passo a Passo

### 1. Conectar na VPS

```bash
ssh usuario@seu-ip-ou-dominio
```

### 2. Executar Script de Deploy

```bash
# Tornar o script executável
chmod +x deploy.sh

# Executar o deploy
./deploy.sh
```

OU execute manualmente:

```bash
# Iniciar aplicação com PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5. Configurar Nginx

```bash
# Copiar configuração do Nginx
sudo cp /var/www/otanpay/nginx.conf /etc/nginx/sites-available/otanpay

# IMPORTANTE: Editar o arquivo e substituir 'seu-dominio.com' pelo seu domínio real
sudo nano /etc/nginx/sites-available/otanpay

# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/otanpay /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 6. Configurar SSL com Let's Encrypt

```bash
# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Seguir as instruções interativas
# Certbot vai configurar automaticamente o Nginx para HTTPS
```

### 7. Atualizar Configuração do Nginx para HTTPS

Após o Certbot, edite o arquivo novamente para habilitar redirecionamento HTTP→HTTPS:

```bash
sudo nano /etc/nginx/sites-available/otanpay
```

Descomente as linhas de SSL e o bloco de redirecionamento HTTP.

### 8. Verificar Status

```bash
# Verificar PM2
pm2 status
pm2 logs otanpay

# Verificar Nginx
sudo systemctl status nginx

# Verificar SSL
sudo certbot certificates
```

## 🔄 Atualizações Futuras

Para atualizar a aplicação:

```bash
cd /var/www/otanpay
git pull origin main
npm install --production
pm2 restart otanpay
```

## 🛠️ Comandos Úteis

### PM2
```bash
pm2 status              # Ver status
pm2 logs otanpay        # Ver logs
pm2 restart otanpay     # Reiniciar
pm2 stop otanpay        # Parar
pm2 delete otanpay      # Remover
```

### Nginx
```bash
sudo nginx -t           # Testar configuração
sudo systemctl restart nginx  # Reiniciar
sudo systemctl status nginx   # Ver status
```

### SSL
```bash
sudo certbot renew      # Renovar certificado
sudo certbot certificates  # Ver certificados
```

## 🔒 Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver status
sudo ufw status
```

## 📝 Variáveis de Ambiente

Crie um arquivo `.env` em `/var/www/otanpay/`:

```env
PORT=3000
NODE_ENV=production
```

## 🐛 Troubleshooting

### Aplicação não inicia
```bash
pm2 logs otanpay
cd /var/www/otanpay
node server.js  # Testar manualmente
```

### Nginx não funciona
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### SSL não funciona
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### Porta 3000 já em uso
```bash
sudo lsof -i :3000
# Ou altere a porta no .env e server.js
```

## 📞 Suporte

Se tiver problemas, verifique:
1. Logs do PM2: `pm2 logs otanpay`
2. Logs do Nginx: `sudo tail -f /var/log/nginx/error.log`
3. Status dos serviços: `pm2 status` e `sudo systemctl status nginx`

