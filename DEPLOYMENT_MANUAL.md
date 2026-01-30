# Guia de Ativação Manual - Vya Nexus

Este documento descreve como ativar manualmente o Vya Nexus em seu servidor de produção. **Nenhum comando foi executado automaticamente** - todas as configurações estão prontas para ativação manual.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em seu servidor:

- Node.js 18+ e npm/pnpm
- MySQL 8.0+
- Nginx
- Certbot (para Let's Encrypt)
- PM2 (opcional, mas recomendado)

## Estrutura de Arquivos

Os arquivos de configuração estão organizados da seguinte forma:

```
/home/ubuntu/vya-nexus/
├── nginx/
│   ├── vya-nexus.conf       # Configuração principal do Nginx
│   ├── upstream.conf        # Definição de upstreams
│   └── ssl.conf             # Configurações SSL/TLS
├── ecosystem.config.js      # Configuração do PM2
├── DNS_CONFIGURATION.md     # Registros DNS necessários
├── INFRASTRUCTURE.md        # Documentação de infraestrutura
└── DEPLOYMENT_MANUAL.md     # Este arquivo
```

## Passo 1: Preparar o Servidor

### 1.1 Atualizar o Sistema

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 1.2 Instalar Dependências

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
npm install -g pnpm

# Nginx
sudo apt-get install -y nginx

# Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# PM2 (opcional)
sudo npm install -g pm2

# MySQL
sudo apt-get install -y mysql-server
```

## Passo 2: Configurar o Banco de Dados

### 2.1 Criar Banco de Dados e Usuário

```bash
sudo mysql -u root -p << EOF
CREATE DATABASE vya_nexus;
CREATE USER 'vya_user'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON vya_nexus.* TO 'vya_user'@'localhost';
FLUSH PRIVILEGES;
EOF
```

### 2.2 Executar Migrações

```bash
cd /home/ubuntu/vya-nexus
pnpm db:push
```

## Passo 3: Configurar Certificados SSL com Let's Encrypt

### 3.1 Gerar Certificados

```bash
sudo certbot certonly --nginx \
  -d nexus.vyaconcept.com.br \
  -d admin-nexus.vyaconcept.com.br \
  -d cloud.vyaconcept.com.br \
  -d email.vyaconcept.com.br \
  -d hosting.vyaconcept.com.br
```

### 3.2 Configurar Renovação Automática

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Testar renovação
sudo certbot renew --dry-run
```

## Passo 4: Configurar Nginx

### 4.1 Copiar Arquivos de Configuração

```bash
# Copiar arquivo de upstream
sudo cp /home/ubuntu/vya-nexus/nginx/upstream.conf /etc/nginx/conf.d/

# Copiar arquivo de SSL
sudo cp /home/ubuntu/vya-nexus/nginx/ssl.conf /etc/nginx/conf.d/

# Copiar arquivo principal
sudo cp /home/ubuntu/vya-nexus/nginx/vya-nexus.conf /etc/nginx/sites-available/

# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/vya-nexus.conf /etc/nginx/sites-enabled/

# Remover configuração padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default
```

### 4.2 Testar Configuração do Nginx

```bash
sudo nginx -t
```

Se tudo estiver correto, você verá:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4.3 Ativar Nginx

```bash
sudo systemctl enable nginx
sudo systemctl start nginx

# Verificar status
sudo systemctl status nginx
```

## Passo 5: Build da Aplicação

### 5.1 Instalar Dependências

```bash
cd /home/ubuntu/vya-nexus
pnpm install
```

### 5.2 Build do Projeto

```bash
pnpm build
```

## Passo 6: Iniciar Aplicação com PM2

### 6.1 Iniciar Processos

```bash
cd /home/ubuntu/vya-nexus
pm2 start ecosystem.config.js
```

### 6.2 Configurar Auto-restart

```bash
pm2 startup
pm2 save
```

### 6.3 Verificar Status

```bash
pm2 status
pm2 logs
pm2 monit
```

## Passo 7: Configurar Registros DNS

Consulte o arquivo `DNS_CONFIGURATION.md` para adicionar os registros A no seu provedor de domínio (Registro.br, GoDaddy, etc.).

Os registros necessários são:

| Nome | Tipo | Valor | TTL |
|------|------|-------|-----|
| nexus | A | [SEU_IP_DO_SERVIDOR] | 3600 |
| admin-nexus | A | [SEU_IP_DO_SERVIDOR] | 3600 |
| cloud | A | [SEU_IP_DO_SERVIDOR] | 3600 |
| email | A | [SEU_IP_DO_SERVIDOR] | 3600 |
| hosting | A | [SEU_IP_DO_SERVIDOR] | 3600 |

## Passo 8: Validação

### 8.1 Verificar Resolução DNS

```bash
nslookup nexus.vyaconcept.com.br
dig nexus.vyaconcept.com.br A
```

### 8.2 Verificar Certificados SSL

```bash
openssl s_client -connect nexus.vyaconcept.com.br:443
```

### 8.3 Verificar Aplicação

Acesse em seu navegador:
- https://nexus.vyaconcept.com.br
- https://admin-nexus.vyaconcept.com.br
- https://cloud.vyaconcept.com.br
- https://email.vyaconcept.com.br
- https://hosting.vyaconcept.com.br

## Monitoramento e Manutenção

### Verificar Logs

```bash
# Logs do Nginx
sudo tail -f /var/log/nginx/nexus-access.log
sudo tail -f /var/log/nginx/nexus-error.log

# Logs do PM2
pm2 logs vya-nexus-dashboard
pm2 logs vya-nexus-admin
pm2 logs vya-nexus-cloud
pm2 logs vya-nexus-email
pm2 logs vya-nexus-hosting
```

### Reiniciar Serviços

```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar aplicação
pm2 restart all

# Recarregar aplicação (sem downtime)
pm2 reload all
```

### Renovar Certificados

```bash
# Renovar manualmente
sudo certbot renew

# Recarregar Nginx após renovação
sudo systemctl reload nginx
```

## Troubleshooting

### Nginx não inicia

```bash
# Verificar erros de sintaxe
sudo nginx -t

# Verificar se a porta 80/443 está em uso
sudo lsof -i :80
sudo lsof -i :443

# Verificar logs
sudo tail -f /var/log/nginx/error.log
```

### Aplicação não responde

```bash
# Verificar se PM2 está rodando
pm2 status

# Verificar logs
pm2 logs

# Reiniciar
pm2 restart all
```

### Certificado SSL expirado

```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Recarregar Nginx
sudo systemctl reload nginx

# Verificar data de expiração
openssl x509 -enddate -noout -in /etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem
```

### DNS não resolve

```bash
# Limpar cache DNS
sudo systemctl restart systemd-resolved

# Verificar propagação
dig nexus.vyaconcept.com.br
nslookup nexus.vyaconcept.com.br

# Usar ferramentas online
# - https://mxtoolbox.com/
# - https://dnschecker.org/
# - https://www.whatsmydns.net/
```

## Checklist de Ativação

- [ ] Sistema atualizado
- [ ] Dependências instaladas (Node.js, MySQL, Nginx, Certbot, PM2)
- [ ] Banco de dados criado e configurado
- [ ] Migrações executadas
- [ ] Certificados SSL gerados
- [ ] Arquivos Nginx copiados
- [ ] Configuração Nginx testada
- [ ] Nginx ativado e rodando
- [ ] Aplicação buildada
- [ ] PM2 iniciado
- [ ] Registros DNS configurados
- [ ] DNS propagado (aguardar até 48 horas)
- [ ] Aplicação acessível via HTTPS
- [ ] Certificados válidos
- [ ] Logs monitorados

## Próximos Passos

1. **Monitorar logs** - Acompanhe os logs de erro para identificar problemas
2. **Testar funcionalidades** - Teste o fluxo de cadastro, pagamento, upload de arquivos
3. **Configurar backups** - Implemente backup automático do banco de dados
4. **Configurar alertas** - Configure alertas para erros críticos e certificados expirando
5. **Documentar runbooks** - Crie documentação de procedimentos operacionais

## Referências

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
