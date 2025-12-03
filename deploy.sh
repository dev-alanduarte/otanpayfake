#!/bin/bash

# Script de Deploy para VPS - OtanPay
# Execute: chmod +x deploy.sh && ./deploy.sh

echo "🚀 Iniciando deploy do OtanPay..."

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (se não estiver instalado)
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Instalar PM2 (gerenciador de processos)
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    sudo npm install -g pm2
fi

# Instalar Nginx (se não estiver instalado)
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    sudo apt install -y nginx
fi

# Instalar Certbot (Let's Encrypt)
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    sudo apt install -y certbot python3-certbot-nginx
fi

# Criar diretório da aplicação
APP_DIR="/var/www/otanpay"
echo "📁 Criando diretório da aplicação em $APP_DIR..."
sudo mkdir -p $APP_DIR
sudo chown -R $USER:$USER $APP_DIR

# Clonar ou atualizar repositório
if [ -d "$APP_DIR/.git" ]; then
    echo "🔄 Atualizando código..."
    cd $APP_DIR
    git pull origin main
else
    echo "📥 Clonando repositório..."
    cd /var/www
    sudo git clone https://github.com/dev-alanduarte/otanpayfake.git otanpay
    sudo chown -R $USER:$USER $APP_DIR
    cd $APP_DIR
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# Criar arquivo .env se não existir
if [ ! -f "$APP_DIR/.env" ]; then
    echo "📝 Criando arquivo .env..."
    cat > $APP_DIR/.env << EOF
PORT=3000
NODE_ENV=production
EOF
fi

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 delete otanpay 2>/dev/null || true
pm2 start server.js --name otanpay --instances 2
pm2 save
pm2 startup

echo "✅ Deploy concluído!"
echo "📝 Próximos passos:"
echo "   1. Configure o Nginx (veja nginx.conf)"
echo "   2. Configure o SSL com: sudo certbot --nginx -d seu-dominio.com"
echo "   3. Reinicie o Nginx: sudo systemctl restart nginx"

