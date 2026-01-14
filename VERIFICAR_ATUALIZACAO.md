# 🔍 Verificar e Corrigir Atualização na VPS

## ⚠️ Problema: Dados Antigos e Mudanças Não Aplicadas

Se a aplicação ainda mostra dados antigos, siga estes passos:

## 🔄 Passo a Passo para Atualizar Corretamente

### 1. Conectar na VPS
```bash
ssh root@181.224.24.59
# ou
ssh usuario@181.224.24.59
```

### 2. Ir para o diretório do projeto
```bash
cd ~/otanpayfake
# ou o caminho onde está seu projeto
```

### 3. Verificar versão atual do código
```bash
# Ver último commit
git log -1

# Ver status do Git
git status

# Ver se há mudanças não commitadas
git diff
```

### 4. Fazer backup do banco ANTES de qualquer coisa
```bash
# Backup com data
cp database.sqlite database.sqlite.backup.$(date +%Y%m%d_%H%M%S)

# Verificar se backup foi criado
ls -lh database.sqlite*
```

### 5. Parar aplicação
```bash
pm2 stop server
# ou
pm2 stop all
```

### 6. Atualizar código do GitHub
```bash
# Buscar atualizações
git fetch origin

# Ver diferenças
git diff main origin/main

# Atualizar código
git pull origin main
```

### 7. Verificar se arquivos foram atualizados
```bash
# Verificar se middleware/auth.js existe (nova funcionalidade)
ls -la middleware/

# Verificar se server.js foi atualizado
head -20 server.js | grep -i "cookie\|helmet\|rate"
```

### 8. Instalar/Atualizar dependências
```bash
# Limpar node_modules antigo (opcional, mas recomendado)
rm -rf node_modules package-lock.json

# Instalar dependências novamente
npm install --production

# Verificar se novas dependências foram instaladas
npm list | grep -E "cookie-parser|helmet|express-rate-limit|jsonwebtoken"
```

### 9. Verificar banco de dados
```bash
# Ver se banco tem estrutura antiga (sem coluna role)
sqlite3 database.sqlite "PRAGMA table_info(users);" | grep role

# Se não tiver coluna role, o código vai adicionar automaticamente
```

### 10. Reiniciar aplicação
```bash
# Reiniciar
pm2 restart server

# Ver logs imediatamente
pm2 logs server --lines 50
```

### 11. Verificar se está rodando versão nova
```bash
# Ver logs de inicialização
pm2 logs server --lines 20 --nostream

# Deve mostrar:
# - ✅ Conectado ao banco de dados SQLite
# - ✅ Tabela users criada/verificada
# - ✅ Tabela transactions criada/verificada
# - 🚀 Servidor rodando em http://localhost:3000
```

## 🔧 Se Ainda Não Funcionar

### Opção 1: Deletar banco e recriar (PERDE TODOS OS DADOS)
```bash
# ⚠️ ATENÇÃO: Isso vai apagar TODOS os dados!
pm2 stop server
rm database.sqlite
pm2 restart server
# O banco será recriado automaticamente
```

### Opção 2: Forçar atualização completa
```bash
# Parar tudo
pm2 stop all
pm2 delete all

# Limpar tudo
rm -rf node_modules package-lock.json

# Atualizar código
git fetch origin
git reset --hard origin/main

# Reinstalar
npm install --production

# Recriar banco (se necessário)
# mv database.sqlite database.sqlite.old
# (deixar o código criar novo)

# Iniciar novamente
pm2 start server.js --name server
pm2 save
```

### Opção 3: Verificar se há conflitos
```bash
# Ver se há arquivos locais modificados
git status

# Se houver, descartar mudanças locais
git reset --hard HEAD
git clean -fd

# Depois fazer pull novamente
git pull origin main
```

## 🧪 Testar se Atualização Funcionou

### 1. Verificar se middleware existe
```bash
ls -la middleware/auth.js
# Deve existir
```

### 2. Verificar se novas dependências estão instaladas
```bash
npm list cookie-parser helmet express-rate-limit jsonwebtoken
# Todos devem aparecer
```

### 3. Testar no navegador
```
http://181.224.24.59:3000/admin
```

### 4. Verificar logs
```bash
pm2 logs server --lines 30
```

Deve mostrar logs limpos (sem "Buscando usuário", "Usuário encontrado" repetitivos).

## 📋 Checklist Completo

Execute estes comandos na ordem:

```bash
cd ~/otanpayfake && \
echo "=== 1. Backup ===" && \
cp database.sqlite database.sqlite.backup.$(date +%Y%m%d_%H%M%S) && \
echo "✅ Backup criado" && \
echo -e "\n=== 2. Parar aplicação ===" && \
pm2 stop server && \
echo "✅ Aplicação parada" && \
echo -e "\n=== 3. Atualizar código ===" && \
git fetch origin && \
git pull origin main && \
echo "✅ Código atualizado" && \
echo -e "\n=== 4. Instalar dependências ===" && \
npm install --production && \
echo "✅ Dependências instaladas" && \
echo -e "\n=== 5. Reiniciar ===" && \
pm2 restart server && \
echo "✅ Aplicação reiniciada" && \
echo -e "\n=== 6. Verificar logs ===" && \
sleep 2 && \
pm2 logs server --lines 20 --nostream
```

## 🐛 Problemas Comuns

### "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules
npm install --production
```

### "Port already in use"
```bash
# Ver qual processo está usando
sudo lsof -i :3000
# Matar processo
kill -9 PID
# Reiniciar PM2
pm2 restart server
```

### Banco de dados travado
```bash
# Parar aplicação
pm2 stop server
# Verificar se banco está OK
sqlite3 database.sqlite "PRAGMA integrity_check;"
# Se der erro, restaurar backup
cp database.sqlite.backup.* database.sqlite
```

## ✅ Confirmar que Funcionou

Após atualizar, verifique:

1. ✅ `middleware/auth.js` existe
2. ✅ Logs não mostram mensagens repetitivas
3. ✅ Login admin funciona
4. ✅ Painel admin carrega
5. ✅ Não mostra mais dados antigos problemáticos
