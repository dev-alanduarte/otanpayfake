#!/bin/bash

# Script Rápido de Setup VPS - OtanPay
# Execute na VPS após clonar o repositório

set -e

echo "🚀 Setup OtanPay na VPS"
echo "========================"

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Execute com sudo: sudo bash setup-vps.sh"
    exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
apt update && apt upgrade -y

# Instalar Node.js 18.x
if ! command -v node &> /dev/null; then
    echo "📦 Instalando Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Instalar PM2 globalmente
if ! command -v pm2 &> /dev/null; then
    echo "📦 Instalando PM2..."
    npm install -g pm2
fi

# Instalar Nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    apt install -y nginx
fi

# Instalar Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    apt install -y certbot python3-certbot-nginx
fi

# Instalar UFW (Firewall)
if ! command -v ufw &> /dev/null; then
    echo "📦 Instalando UFW..."
    apt install -y ufw
fi

# Configurar Firewall
echo "🔥 Configurando Firewall..."
ufw --force enable
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

# Criar diretório da aplicação
APP_DIR="/var/www/otanpay"
echo "📁 Criando diretório $APP_DIR..."
mkdir -p $APP_DIR

# Obter usuário atual (não root)
CURRENT_USER=${SUDO_USER:-$USER}

# Ajustar permissões
chown -R $CURRENT_USER:$CURRENT_USER $APP_DIR

echo ""
echo "✅ Setup básico concluído!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Clone o repositório em $APP_DIR"
echo "   2. Execute: cd $APP_DIR && npm install --production"
echo "   3. Configure o Nginx (veja nginx.conf)"
echo "   4. Configure SSL: sudo certbot --nginx -d seu-dominio.com"
echo "   5. Inicie com PM2: pm2 start ecosystem.config.js"
echo ""

