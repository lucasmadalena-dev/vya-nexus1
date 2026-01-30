# Vya Nexus - Lista de Tarefas do MVP

## Infraestrutura e Configuração
- [x] Configurar esquema do banco de dados multi-tenant
- [x] Configurar integração com Stripe API
- [x] Configurar sistema de storage S3

## Autenticação e Onboarding
- [x] Implementar fluxo de Sign up/Login com Manus OAuth
- [x] Criar página de onboarding pós-cadastro
- [x] Implementar seleção de plano e seats durante onboarding

## Sistema de Pagamentos e Assinaturas
- [x] Integrar Stripe Checkout para assinaturas recorrentes
- [x] Implementar sistema de seats (contas de email + storage)
- [ ] Criar painel de gerenciamento de assinatura
- [ ] Implementar webhooks do Stripe para atualização de status

## Vya Cloud (Storage)
- [x] Criar interface de upload de arquivos
- [x] Implementar sistema de pastas e organização
- [x] Adicionar barra de busca de arquivos
- [ ] Implementar visualização prévia de documentos
- [x] Adicionar indicador de uso de storage
- [x] Implementar download de arquivos

## Vya Email (Communication)
- [x] Criar painel de cadastro de domínio próprio
- [x] Implementar verificação de DNS
- [x] Criar sistema de provisionamento de contas de email
- [x] Implementar configurações SMTP/IMAP
- [x] Adicionar opção de vincular contas externas (Gmail/Outlook)
- [ ] Criar interface de gerenciamento de contas de email

## Vya Hosting (Web)
- [x] Criar módulo de upload de arquivos de site
- [x] Implementar sistema de deploy de sites estáticos
- [x] Adicionar automação de certificados SSL
- [ ] Criar painel de gerenciamento de sites hospedados
- [x] Implementar visualização de domínios customizados

## Painel Administrativo
- [x] Criar dashboard com visão geral de usuários ativos
- [x] Implementar relatório de faturamento
- [x] Adicionar métricas de uso total de storage
- [x] Criar listagem de tenants com filtros
- [ ] Implementar gráficos de crescimento e métricas

## Sistema de Notificações
- [ ] Implementar notificações de alertas de faturamento
- [ ] Adicionar alertas de limites de storage atingidos
- [ ] Criar notificações de novos cadastros de usuários
- [ ] Implementar alertas de eventos críticos da plataforma

## Chatbot Inteligente
- [x] Integrar LLM para chatbot
- [ ] Criar interface de chat no painel do usuário
- [x] Implementar base de conhecimento sobre DNS
- [x] Adicionar troubleshooting de email/hosting
- [x] Implementar histórico de conversas

## Documentação e API
- [ ] Criar documentação da API REST
- [ ] Documentar endpoints tRPC
- [ ] Adicionar exemplos de integração
- [ ] Criar guia de início rápido

## Testes e Validação
- [ ] Escrever testes unitários para procedures críticas
- [ ] Testar fluxo completo de onboarding
- [ ] Validar integração com Stripe
- [ ] Testar upload e download de arquivos
- [ ] Validar sistema multi-tenant

## Página de Apresentação
- [ ] Criar página web interativa de apresentação dos resultados


## Tarefas Finais - Pronto para Mercado

### Persistência Real do Vya Cloud (S3)
- [x] Configurar credenciais AWS S3
- [x] Implementar upload real de arquivos para S3
- [x] Implementar download com URLs pré-assinadas
- [x] Adicionar validação de tamanho de arquivo
- [x] Implementar deleção de arquivos do S3

### UI de Gestão de Recursos
- [x] Criar página de gerenciamento de domínios
- [x] Criar página de gerenciamento de contas de email
- [x] Criar página de gerenciamento de sites hospedados
- [x] Implementar formulários de cadastro com validação
- [x] Adicionar confirmação visual de ações

### Automação de Assinaturas (Webhooks Stripe)
- [x] Implementar endpoint de webhook do Stripe
- [x] Processar eventos de pagamento bem-sucedido
- [x] Processar eventos de cancelamento de assinatura
- [x] Atualizar status de tenant no banco de dados
- [x] Implementar lógica de suspensão de acesso

### Testes e Deploy
- [ ] Testar fluxo completo de pagamento
- [ ] Testar upload e download de arquivos
- [ ] Testar criação de domínios e contas de email
- [ ] Validar segurança e permissões multi-tenant
- [ ] Deploy para produção


## Infraestrutura de Domínio vyaconcept.com.br

### Configuração de Subdomínios
- [x] Implementar roteamento de subdomínios (nexus, cloud, email, www)
- [x] Configurar mapeamento de aplicações por subdomínio
- [x] Adicionar suporte a wildcard para subdomínios de clientes
- [x] Implementar validação de subdomínio

### Email Nativo @vyaconcept.com.br
- [x] Configurar domínio padrão para contas de email
- [x] Implementar criação automática de contas @vyaconcept.com.br
- [x] Adicionar suporte a aliases de email
- [x] Implementar sincronização com servidor SMTP/IMAP

### Registros DNS e Documentação
- [x] Documentar registros A para subdomínios
- [x] Documentar registros CNAME para CDN
- [x] Documentar registros MX para email
- [x] Documentar registros TXT para SPF/DKIM
- [x] Criar guia de configuração no provedor de domínio

### Let's Encrypt e SSL
- [x] Preparar integração com Let's Encrypt
- [x] Implementar renovação automática de certificados
- [x] Configurar certificados wildcard para subdomínios
- [x] Remover simulação de SSL (mkcert)

### Finalização
- [x] Testar roteamento de subdomínios
- [x] Validar certificados SSL
- [x] Testar criação de email @vyaconcept.com.br
- [x] Preparar ambiente de produção


## Isolamento de Domínio e Reestruturação de Admin

### Remover Configurações de Domínio Raíz
- [x] Remover subdomínio raíz (@) de subdomains.ts
- [x] Remover subdomínio www de subdomains.ts
- [x] Remover configurações de website público
- [x] Remover redirecionamento do domínio raíz

### Reestruturar Admin para admin-nexus.vyaconcept.com.br
- [x] Renomear admin para admin-nexus
- [x] Atualizar rotas do painel administrativo
- [x] Atualizar configuração de subdomínios
- [x] Atualizar rotas no App.tsx

### Atualizar Documentação DNS
- [x] Remover registros A para domínio raíz
- [x] Remover registros A para www
- [x] Remover registros CNAME para www
- [x] Manter apenas registros para nexus, admin-nexus, cloud, email, hosting
- [x] Atualizar DNS_CONFIGURATION.md

### URL Final de Acesso
- [x] Fornecer URL final: https://nexus.vyaconcept.com.br
- [x] Documentar URL de admin: https://admin-nexus.vyaconcept.com.br


## Configuração de Nginx e PM2 (Sem Execução)

### Arquivos de Configuração Nginx
- [x] Criar arquivo nginx/vya-nexus.conf com rotas dos subdomínios
- [x] Criar arquivo nginx/ssl.conf com configurações de SSL
- [x] Criar arquivo nginx/upstream.conf com definição de upstreams
- [x] Documentar passos de ativação manual

### Arquivo de Configuração PM2
- [x] Criar arquivo ecosystem.config.js com configuração de processos
- [x] Documentar como iniciar com PM2
- [x] Documentar como configurar auto-restart

### Guia de Ativação Manual
- [x] Criar DEPLOYMENT_MANUAL.md com instruções passo a passo
- [x] Documentar como copiar arquivos Nginx
- [x] Documentar como ativar Let's Encrypt
- [x] Documentar como iniciar PM2
