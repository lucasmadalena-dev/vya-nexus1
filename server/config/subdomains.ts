/**
 * Configuração de Subdomínios para vyaconcept.com.br
 * Define o mapeamento de subdomínios para diferentes aplicações
 */

export const MAIN_DOMAIN = "vyaconcept.com.br";

export const SUBDOMAINS = {
  // Painel principal do Vya Nexus
  nexus: {
    name: "nexus",
    fullDomain: `nexus.${MAIN_DOMAIN}`,
    description: "Painel principal do Vya Nexus",
    service: "dashboard",
    port: 3000,
  },

  // Serviço de Cloud Storage
  cloud: {
    name: "cloud",
    fullDomain: `cloud.${MAIN_DOMAIN}`,
    description: "Vya Cloud - Armazenamento em nuvem",
    service: "cloud",
    port: 3001,
  },

  // Serviço de Email
  email: {
    name: "email",
    fullDomain: `email.${MAIN_DOMAIN}`,
    description: "Vya Email - Gerenciador de email profissional",
    service: "email",
    port: 3002,
  },

  // Serviço de Hosting
  hosting: {
    name: "hosting",
    fullDomain: `hosting.${MAIN_DOMAIN}`,
    description: "Vya Hosting - Hospedagem de sites",
    service: "hosting",
    port: 3003,
  },

  // Painel administrativo exclusivo do Nexus
  adminNexus: {
    name: "admin-nexus",
    fullDomain: `admin-nexus.${MAIN_DOMAIN}`,
    description: "Painel administrativo do Vya Nexus",
    service: "admin",
    port: 3004,
  },
};

/**
 * Configuração de Email
 * Define os servidores SMTP/IMAP e configurações de email
 */
export const EMAIL_CONFIG = {
  // Domínio padrão para contas de email
  defaultDomain: MAIN_DOMAIN,

  // Servidor SMTP para envio
  smtp: {
    host: `smtp.${MAIN_DOMAIN}`,
    port: 587,
    secure: false, // true para porta 465, false para 587
    auth: {
      user: "noreply@vyaconcept.com.br",
      pass: process.env.SMTP_PASSWORD || "",
    },
  },

  // Servidor IMAP para recebimento
  imap: {
    host: `imap.${MAIN_DOMAIN}`,
    port: 993,
    secure: true,
  },

  // Configurações de SPF, DKIM e DMARC
  security: {
    spf: "v=spf1 include:sendgrid.net ~all",
    dkim: {
      selector: "default",
      publicKey: process.env.DKIM_PUBLIC_KEY || "",
    },
    dmarc: "v=DMARC1; p=quarantine; rua=mailto:dmarc@vyaconcept.com.br",
  },
};

/**
 * Configuração de SSL/TLS
 * Define certificados e configurações de segurança
 */
export const SSL_CONFIG = {
  // Certificado wildcard para todos os subdomínios
  wildcard: {
    domain: `*.${MAIN_DOMAIN}`,
    certPath: process.env.SSL_CERT_PATH || "/etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem",
    keyPath: process.env.SSL_KEY_PATH || "/etc/letsencrypt/live/vyaconcept.com.br/privkey.pem",
  },

  // Certificado para domínio raiz
  root: {
    domain: MAIN_DOMAIN,
    certPath: process.env.SSL_CERT_PATH || "/etc/letsencrypt/live/vyaconcept.com.br/fullchain.pem",
    keyPath: process.env.SSL_KEY_PATH || "/etc/letsencrypt/live/vyaconcept.com.br/privkey.pem",
  },

  // Let's Encrypt configuration
  letsencrypt: {
    enabled: process.env.NODE_ENV === "production",
    email: "admin@vyaconcept.com.br",
    renewalDays: 30, // Renovar 30 dias antes do vencimento
  },
};

/**
 * Função para obter configuração de subdomínio
 */
export function getSubdomainConfig(subdomain: string) {
  return SUBDOMAINS[subdomain as keyof typeof SUBDOMAINS] || null;
}

/**
 * Função para validar se um subdomínio é válido
 */
export function isValidSubdomain(subdomain: string): boolean {
  const validPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
  return validPattern.test(subdomain) && subdomain.length <= 63;
}

/**
 * Função para extrair subdomínio de um hostname
 */
export function extractSubdomain(hostname: string): string | null {
  const parts = hostname.split(".");

  // Se é localhost ou IP, retorna null
  if (hostname === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    return null;
  }

  // Se tem menos de 3 partes, não é um subdomínio válido do Nexus
  if (parts.length < 3) {
    return null;
  }

  // Retorna a primeira parte como subdomínio
  return parts[0];
}

/**
 * Função para gerar URL completa de um serviço
 */
export function getServiceUrl(service: keyof typeof SUBDOMAINS, protocol = "https"): string {
  const config = SUBDOMAINS[service];
  if (!config) {
    throw new Error(`Serviço desconhecido: ${service}`);
  }

  const isDevelopment = process.env.NODE_ENV !== "production";
  if (isDevelopment) {
    return `http://localhost:${config.port}`;
  }

  return `${protocol}://${config.fullDomain}`;
}
