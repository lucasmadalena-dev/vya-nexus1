# Configuração de Registros DNS para vyaconcept.com.br

Este documento descreve todos os registros DNS necessários para configurar o domínio vyaconcept.com.br com suporte completo aos serviços Vya Nexus em produção.

## Visão Geral da Infraestrutura

O Vya Nexus utiliza uma arquitetura de subdomínios para separar diferentes serviços:

| Subdomínio | Serviço | Descrição |
|-----------|---------|-----------|
| `nexus.vyaconcept.com.br` | Dashboard Principal | Painel de controle do Vya Nexus |
| `cloud.vyaconcept.com.br` | Vya Cloud | Armazenamento em nuvem |
| `email.vyaconcept.com.br` | Vya Email | Gerenciador de email profissional |
| `hosting.vyaconcept.com.br` | Vya Hosting | Hospedagem de sites estáticos |
| `admin.vyaconcept.com.br` | Painel Admin | Administração do sistema |
| `www.vyaconcept.com.br` | Website Público | Página inicial e marketing |
| `vyaconcept.com.br` | Domínio Raiz | Redireciona para www |

## Registros DNS Necessários

### 1. Registros A (Apontamento para IP)

Configure os seguintes registros A para apontar os subdomínios para o servidor de produção:

```
Tipo: A
Nome: nexus
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600

Tipo: A
Nome: cloud
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600

Tipo: A
Nome: email
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600

Tipo: A
Nome: hosting
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600

Tipo: A
Nome: admin
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600

Tipo: A
Nome: www
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600

Tipo: A
Nome: @ (raiz)
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600
```

**Nota:** Substitua `[SEU_IP_DO_SERVIDOR]` pelo IP público do seu servidor de produção.

### 2. Registros CNAME (Alias)

Se você utilizar um CDN ou serviço de proxy, configure os registros CNAME:

```
Tipo: CNAME
Nome: cdn
Valor: [SEU_CDN_ENDPOINT]
TTL: 3600

Tipo: CNAME
Nome: api
Valor: nexus.vyaconcept.com.br
TTL: 3600
```

### 3. Registros MX (Mail Exchange)

Configure os registros MX para rotear emails para o servidor de email do Vya Nexus:

```
Tipo: MX
Nome: @ (raiz)
Valor: mail.vyaconcept.com.br
Prioridade: 10
TTL: 3600

Tipo: MX
Nome: @ (raiz)
Valor: mail2.vyaconcept.com.br
Prioridade: 20
TTL: 3600
```

**Nota:** Configure pelo menos dois servidores MX para redundância.

### 4. Registros TXT (SPF, DKIM, DMARC)

#### SPF (Sender Policy Framework)

O SPF ajuda a prevenir spoofing de email:

```
Tipo: TXT
Nome: @ (raiz)
Valor: v=spf1 include:sendgrid.net include:mail.vyaconcept.com.br ~all
TTL: 3600
```

#### DKIM (DomainKeys Identified Mail)

Configure o DKIM para assinar digitalmente emails:

```
Tipo: TXT
Nome: default._domainkey
Valor: [DKIM_PUBLIC_KEY_AQUI]
TTL: 3600
```

**Nota:** Substitua `[DKIM_PUBLIC_KEY_AQUI]` pela chave pública DKIM gerada pelo seu servidor de email.

#### DMARC (Domain-based Message Authentication)

Configure o DMARC para política de autenticação:

```
Tipo: TXT
Nome: _dmarc
Valor: v=DMARC1; p=quarantine; rua=mailto:dmarc@vyaconcept.com.br; ruf=mailto:dmarc@vyaconcept.com.br; fo=1
TTL: 3600
```

### 5. Registros para Let's Encrypt (Validação ACME)

Se utilizar Let's Encrypt com validação DNS, configure:

```
Tipo: TXT
Nome: _acme-challenge
Valor: [TOKEN_ACME_AQUI]
TTL: 300
```

**Nota:** Este registro é temporário e usado apenas durante a validação do certificado.

### 6. Registros para Wildcard SSL

Para suportar subdomínios de clientes (ex: cliente1.vyaconcept.com.br):

```
Tipo: A
Nome: *.clientes
Valor: [SEU_IP_DO_SERVIDOR]
TTL: 3600

Tipo: TXT
Nome: _acme-challenge.*.clientes
Valor: [TOKEN_ACME_WILDCARD]
TTL: 300
```

## Configuração no Provedor de Domínio

### Passo a Passo Genérico

1. **Acesse o painel de controle do seu provedor de domínio** (GoDaddy, Namecheap, Registro.br, etc.)
2. **Localize a seção de "Gerenciar DNS"** ou "DNS Management"
3. **Adicione os registros A** conforme listado acima
4. **Configure os registros MX** para email
5. **Adicione os registros TXT** para SPF, DKIM e DMARC
6. **Aguarde a propagação DNS** (pode levar até 48 horas)

### Exemplo: Registro.br

Se você utiliza o Registro.br (provedor brasileiro):

1. Acesse https://www.registro.br/
2. Faça login com suas credenciais
3. Vá para "Meus Domínios"
4. Clique no domínio `vyaconcept.com.br`
5. Selecione "Editar Zona"
6. Adicione os registros conforme descrito acima

## Validação de Configuração

### Verificar Registros A

```bash
nslookup nexus.vyaconcept.com.br
dig nexus.vyaconcept.com.br A
```

### Verificar Registros MX

```bash
nslookup -type=MX vyaconcept.com.br
dig vyaconcept.com.br MX
```

### Verificar Registros TXT (SPF)

```bash
nslookup -type=TXT vyaconcept.com.br
dig vyaconcept.com.br TXT
```

### Verificar Propagação DNS

Use ferramentas online como:
- [MXToolbox](https://mxtoolbox.com/)
- [DNSChecker](https://dnschecker.org/)
- [What's My DNS](https://www.whatsmydns.net/)

## Certificados SSL com Let's Encrypt

### Instalação do Certbot

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

### Gerar Certificado Wildcard

```bash
sudo certbot certonly --dns-route53 \
  -d vyaconcept.com.br \
  -d *.vyaconcept.com.br \
  -d *.clientes.vyaconcept.com.br
```

### Renovação Automática

```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

## Configuração de Email

### Servidor SMTP

- **Host:** smtp.vyaconcept.com.br
- **Porta:** 587 (TLS) ou 465 (SSL)
- **Autenticação:** Necessária
- **Usuário:** seu_email@vyaconcept.com.br
- **Senha:** Sua senha

### Servidor IMAP

- **Host:** imap.vyaconcept.com.br
- **Porta:** 993 (SSL)
- **Autenticação:** Necessária
- **Usuário:** seu_email@vyaconcept.com.br
- **Senha:** Sua senha

## Monitoramento e Manutenção

### Verificar Saúde dos Registros DNS

```bash
# Verificar todos os registros
dig vyaconcept.com.br ANY

# Verificar propagação
dig +short vyaconcept.com.br

# Verificar TTL
dig +nocmd vyaconcept.com.br +noall +answer
```

### Renovação de Certificados

Os certificados Let's Encrypt são válidos por 90 dias. Configure renovação automática:

```bash
# Testar renovação
sudo certbot renew --dry-run

# Renovar manualmente
sudo certbot renew
```

## Troubleshooting

### Email não está sendo entregue

1. Verifique os registros MX
2. Valide o SPF com `dig vyaconcept.com.br TXT`
3. Confirme que o DKIM está configurado corretamente
4. Verifique os logs do servidor de email

### Certificado SSL expirado

1. Execute `sudo certbot renew`
2. Reinicie o servidor web
3. Verifique a data de expiração com `openssl s_client -connect nexus.vyaconcept.com.br:443`

### Subdomínio não resolve

1. Aguarde propagação DNS (até 48 horas)
2. Limpe o cache DNS local: `sudo systemctl restart systemd-resolved`
3. Verifique se o registro A foi adicionado corretamente
4. Use `nslookup` para validar

## Referências

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [DNS Record Types](https://en.wikipedia.org/wiki/List_of_DNS_record_types)
- [SPF, DKIM, DMARC Guide](https://www.mailgun.com/blog/email/spf-dkim-dmarc-explained/)
- [RFC 7208 - SPF](https://tools.ietf.org/html/rfc7208)
- [RFC 6376 - DKIM](https://tools.ietf.org/html/rfc6376)
- [RFC 7489 - DMARC](https://tools.ietf.org/html/rfc7489)
