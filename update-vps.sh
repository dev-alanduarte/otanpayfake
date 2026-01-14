#!/bin/bash

echo "🔄 Iniciando atualização da aplicação..."
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Ir para diretório do projeto
cd ~/otanpayfake || cd /var/www/otanpayfake || {
    echo -e "${RED}❌ Erro: Diretório do projeto não encontrado${NC}"
    echo "Por favor, execute este script do diretório do projeto"
    exit 1
}

echo -e "${YELLOW}📁 Diretório: $(pwd)${NC}"
echo ""

# 1. Backup do banco
echo -e "${YELLOW}1️⃣  Criando backup do banco de dados...${NC}"
if [ -f "database.sqlite" ]; then
    BACKUP_FILE="database.sqlite.backup.$(date +%Y%m%d_%H%M%S)"
    cp database.sqlite "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup criado: $BACKUP_FILE${NC}"
else
    echo -e "${YELLOW}⚠️  Banco de dados não encontrado (será criado)${NC}"
fi
echo ""

# 2. Parar aplicação
echo -e "${YELLOW}2️⃣  Parando aplicação...${NC}"
pm2 stop server 2>/dev/null || pm2 stop all
echo -e "${GREEN}✅ Aplicação parada${NC}"
echo ""

# 3. Verificar Git
echo -e "${YELLOW}3️⃣  Verificando Git...${NC}"
if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Repositório Git encontrado${NC}"
    
    # Verificar se há mudanças locais
    if [ -n "$(git status --porcelain)" ]; then
        echo -e "${YELLOW}⚠️  Há mudanças locais. Descartando...${NC}"
        git reset --hard HEAD
        git clean -fd
    fi
    
    # Atualizar código (forçar sobrescrever mudanças locais)
    echo -e "${YELLOW}📥 Atualizando código do GitHub...${NC}"
    git fetch origin
    
    # Descartar qualquer mudança local antes do pull
    git reset --hard origin/main
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Código atualizado${NC}"
    else
        echo -e "${RED}❌ Erro ao atualizar código${NC}"
        echo -e "${YELLOW}Tentando método alternativo...${NC}"
        git stash
        git pull origin main
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Código atualizado${NC}"
    else
        echo -e "${RED}❌ Erro ao atualizar código${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Repositório Git não encontrado${NC}"
    echo "Por favor, clone o repositório primeiro ou atualize manualmente"
    exit 1
fi
echo ""

# 4. Verificar se middleware existe (confirma atualização)
echo -e "${YELLOW}4️⃣  Verificando arquivos atualizados...${NC}"
if [ -f "middleware/auth.js" ]; then
    echo -e "${GREEN}✅ middleware/auth.js encontrado${NC}"
else
    echo -e "${RED}❌ middleware/auth.js NÃO encontrado - atualização pode ter falhado${NC}"
fi
echo ""

# 5. Instalar dependências
echo -e "${YELLOW}5️⃣  Instalando/Atualizando dependências...${NC}"
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependências instaladas${NC}"
else
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi
echo ""

# 6. Verificar dependências críticas
echo -e "${YELLOW}6️⃣  Verificando dependências críticas...${NC}"
MISSING_DEPS=0
for dep in cookie-parser helmet express-rate-limit jsonwebtoken; do
    if npm list "$dep" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $dep instalado${NC}"
    else
        echo -e "${RED}❌ $dep NÃO encontrado${NC}"
        MISSING_DEPS=1
    fi
done

if [ $MISSING_DEPS -eq 1 ]; then
    echo -e "${YELLOW}⚠️  Reinstalando dependências...${NC}"
    rm -rf node_modules package-lock.json
    npm install --production
fi
echo ""

# 7. Reiniciar aplicação
echo -e "${YELLOW}7️⃣  Reiniciando aplicação...${NC}"
pm2 restart server || pm2 start server.js --name server
pm2 save
echo -e "${GREEN}✅ Aplicação reiniciada${NC}"
echo ""

# 8. Aguardar inicialização
echo -e "${YELLOW}8️⃣  Aguardando inicialização...${NC}"
sleep 3
echo ""

# 9. Verificar logs
echo -e "${YELLOW}9️⃣  Verificando logs...${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
pm2 logs server --lines 20 --nostream
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 10. Status final
echo -e "${YELLOW}🔟 Status final:${NC}"
pm2 status
echo ""

echo -e "${GREEN}✅ Atualização concluída!${NC}"
echo ""
echo "🌐 Teste acessando: http://181.224.24.59:3000/admin"
echo ""
