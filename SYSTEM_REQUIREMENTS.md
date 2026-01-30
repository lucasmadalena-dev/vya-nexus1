# Vya Nexus - Requisitos de Sistema

## 📋 Versão Recomendada do Node.js

**Versão Exata Recomendada:** `v22.13.0` (LTS)

**Compatibilidade:**
- ✅ Node.js 20.x+ (LTS)
- ✅ Node.js 22.x (Atual - Recomendado)
- ⚠️ Node.js 18.x (Suporte limitado)
- ❌ Node.js < 18.x (Não suportado)

**Verificar sua versão:**
```bash
node --version
npm --version
pnpm --version
```

---

## 🔧 Dependências de Sistema Necessárias

### **Obrigatórias (DEVE instalar):**

1. **Node.js 20+** - Runtime JavaScript
   - Download: https://nodejs.org
   - Inclui npm automaticamente

2. **pnpm 10.4.1+** - Gerenciador de pacotes (já incluído no projeto)
   ```bash
   npm install -g pnpm@10.4.1
   ```

3. **MySQL 8.0+ ou TiDB** - Banco de dados
   - **Opção 1 (Local):** Instale MySQL Community Server
     - Download: https://dev.mysql.com/downloads/mysql/
     - Versão mínima: 8.0.23
   
   - **Opção 2 (Cloud):** Use TiDB Cloud (recomendado para produção)
     - Sem instalação local necessária
     - Conexão via DATABASE_URL

4. **Git** - Controle de versão
   ```bash
   # macOS
   brew install git
   
   # Ubuntu/Debian
   sudo apt-get install git
   
   # Windows
   # Download: https://git-scm.com/download/win
   ```

### **Opcionais (Recomendados para desenvolvimento):**

5. **OpenSSL 1.1+** - Para certificados SSL/TLS
   - Geralmente pré-instalado em Linux/macOS
   - Windows: Incluído no Git Bash

6. **curl** - Para testar APIs
   ```bash
   # macOS
   brew install curl
   
   # Ubuntu/Debian
   sudo apt-get install curl
   ```

7. **Docker** (Opcional) - Para rodar MySQL em container
   ```bash
   # Download: https://www.docker.com/products/docker-desktop
   
   # Rodar MySQL em Docker
   docker run -d -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0
   ```

---

## 💾 Banco de Dados - Configuração

### **Opção 1: MySQL Local**

```bash
# 1. Instale MySQL
# macOS: brew install mysql
# Ubuntu: sudo apt-get install mysql-server
# Windows: Download de https://dev.mysql.com/downloads/mysql/

# 2. Inicie o serviço
sudo systemctl start mysql  # Linux
brew services start mysql   # macOS

# 3. Crie o banco de dados
mysql -u root -p
CREATE DATABASE vya_nexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# 4. Configure a variável de ambiente
DATABASE_URL=mysql://root:senha@localhost:3306/vya_nexus
```

### **Opção 2: TiDB Cloud (Recomendado)**

```bash
# 1. Crie conta em https://tidbcloud.com
# 2. Crie um cluster
# 3. Copie a connection string
# 4. Configure a variável de ambiente
DATABASE_URL=mysql://user:password@host:4000/vya_nexus?sslmode=require
```

---

## 🚀 Instalação Rápida (Passo a Passo)

### **1. Verificar Pré-requisitos**
```bash
node --version      # Deve ser v20+ ou v22+
npm --version       # Deve ser 10+
pnpm --version      # Deve ser 10.4.1+
git --version       # Deve ser 2.30+
```

### **2. Clonar Repositório**
```bash
git clone <seu-repositorio>
cd vya-nexus
```

### **3. Instalar Dependências**
```bash
pnpm install
```

### **4. Configurar Banco de Dados**
```bash
# Copie o arquivo database_init.sql para seu servidor MySQL
mysql -u root -p vya_nexus < database_init.sql

# Ou configure a variável DATABASE_URL no .env
```

### **5. Configurar Variáveis de Ambiente**
```bash
# Crie arquivo .env na raiz do projeto
# Veja ENV_VARIABLES_REFERENCE.md para lista completa
```

### **6. Executar Migrações**
```bash
pnpm db:push
```

### **7. Iniciar Servidor de Desenvolvimento**
```bash
pnpm dev
```

---

## ⚠️ Problemas Comuns

### **Erro: "Cannot find module 'mysql2'"**
```bash
# Solução: Reinstale dependências
pnpm install
pnpm db:push
```

### **Erro: "ECONNREFUSED 127.0.0.1:3306"**
```bash
# Solução: Verifique se MySQL está rodando
sudo systemctl status mysql      # Linux
brew services list | grep mysql  # macOS

# Se não estiver rodando:
sudo systemctl start mysql       # Linux
brew services start mysql        # macOS
```

### **Erro: "Unknown database 'vya_nexus'"**
```bash
# Solução: Crie o banco de dados
mysql -u root -p
CREATE DATABASE vya_nexus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### **Erro: "Port 3000 already in use"**
```bash
# Solução: Use uma porta diferente
PORT=3001 pnpm dev

# Ou mate o processo anterior
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000    # Windows
```

---

## 📊 Resumo de Requisitos

| Componente | Versão Mínima | Versão Recomendada | Obrigatório |
|-----------|--------------|-------------------|-----------|
| Node.js | 18.x | 22.13.0 | ✅ Sim |
| npm | 9.x | 10.9.2 | ✅ Sim |
| pnpm | 8.x | 10.4.1 | ✅ Sim |
| MySQL | 8.0.23 | 8.0.35+ | ✅ Sim |
| Git | 2.30 | 2.40+ | ✅ Sim |
| OpenSSL | 1.1 | 1.1.1+ | ⚠️ Recomendado |
| Docker | - | Latest | ❌ Opcional |

---

## 🔐 Segurança

- **Nunca** commit `.env` ou arquivos com credenciais
- Use variáveis de ambiente para todas as chaves secretas
- Mantenha Node.js e dependências atualizadas
- Use HTTPS em produção (Let's Encrypt)
- Configure firewall adequadamente

---

**Última atualização:** 30 de Janeiro de 2026
