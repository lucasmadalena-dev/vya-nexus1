/**
 * Configuração do Let's Encrypt para Vya Nexus
 * Gerencia certificados SSL/TLS para vyaconcept.com.br e subdomínios
 */

import fs from "fs";
import path from "path";

export interface CertificateConfig {
  domain: string;
  certPath: string;
  keyPath: string;
  chainPath: string;
  expiresAt?: Date;
}

export class LetsEncryptManager {
  private letsencryptPath = "/etc/letsencrypt/live";
  private mainDomain = "vyaconcept.com.br";
  private isDevelopment = process.env.NODE_ENV !== "production";

  /**
   * Obter configuração de certificado para um domínio
   */
  getCertificateConfig(domain: string): CertificateConfig | null {
    if (this.isDevelopment) {
      // Em desenvolvimento, usar certificados auto-assinados
      return {
        domain,
        certPath: path.join(process.cwd(), ".certs", `${domain}.crt`),
        keyPath: path.join(process.cwd(), ".certs", `${domain}.key`),
        chainPath: path.join(process.cwd(), ".certs", `${domain}-chain.pem`),
      };
    }

    // Em produção, usar certificados do Let's Encrypt
    const certPath = path.join(this.letsencryptPath, this.mainDomain, "fullchain.pem");
    const keyPath = path.join(this.letsencryptPath, this.mainDomain, "privkey.pem");
    const chainPath = path.join(this.letsencryptPath, this.mainDomain, "chain.pem");

    if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
      console.warn(`[Let's Encrypt] Certificados não encontrados para ${domain}`);
      return null;
    }

    return {
      domain,
      certPath,
      keyPath,
      chainPath,
      expiresAt: this.getCertificateExpiration(certPath),
    };
  }

  /**
   * Obter data de expiração do certificado
   */
  private getCertificateExpiration(certPath: string): Date | undefined {
    try {
      const { execSync } = require("child_process");
      const output = execSync(`openssl x509 -enddate -noout -in ${certPath}`, {
        encoding: "utf-8",
      });
      const dateString = output.replace("notAfter=", "").trim();
      return new Date(dateString);
    } catch (error) {
      console.error("[Let's Encrypt] Erro ao obter data de expiração:", error);
      return undefined;
    }
  }

  /**
   * Verificar se certificado está próximo do vencimento
   */
  isCertificateExpiringSoon(domain: string, daysThreshold = 30): boolean {
    const config = this.getCertificateConfig(domain);
    if (!config || !config.expiresAt) {
      return false;
    }

    const now = new Date();
    const daysUntilExpiration = Math.floor((config.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return daysUntilExpiration <= daysThreshold;
  }

  /**
   * Renovar certificado via Certbot
   */
  async renewCertificate(domain: string): Promise<boolean> {
    if (this.isDevelopment) {
      console.log(`[Let's Encrypt] Desenvolvimento: Renovação de certificado simulada para ${domain}`);
      return true;
    }

    try {
      const { execSync } = require("child_process");
      console.log(`[Let's Encrypt] Renovando certificado para ${domain}...`);

      execSync(`certbot renew --cert-name ${domain} --non-interactive --agree-tos`, {
        stdio: "inherit",
      });

      console.log(`[Let's Encrypt] Certificado renovado com sucesso: ${domain}`);
      return true;
    } catch (error) {
      console.error(`[Let's Encrypt] Erro ao renovar certificado: ${error}`);
      return false;
    }
  }

  /**
   * Obter certificado wildcard para subdomínios
   */
  getWildcardCertificate(): CertificateConfig | null {
    return this.getCertificateConfig(`*.${this.mainDomain}`);
  }

  /**
   * Listar todos os certificados disponíveis
   */
  listAvailableCertificates(): string[] {
    if (this.isDevelopment) {
      return ["*.vyaconcept.com.br"];
    }

    try {
      const liveDir = this.letsencryptPath;
      if (!fs.existsSync(liveDir)) {
        return [];
      }

      return fs.readdirSync(liveDir).filter((file) => {
        const fullPath = path.join(liveDir, file);
        return fs.statSync(fullPath).isDirectory();
      });
    } catch (error) {
      console.error("[Let's Encrypt] Erro ao listar certificados:", error);
      return [];
    }
  }

  /**
   * Validar certificado
   */
  validateCertificate(domain: string): boolean {
    const config = this.getCertificateConfig(domain);
    if (!config) {
      return false;
    }

    try {
      const { execSync } = require("child_process");
      execSync(`openssl verify -CAfile ${config.chainPath} ${config.certPath}`, {
        stdio: "ignore",
      });
      return true;
    } catch (error) {
      console.error(`[Let's Encrypt] Certificado inválido para ${domain}:`, error);
      return false;
    }
  }
}

// Instância global
export const letsencryptManager = new LetsEncryptManager();

/**
 * Middleware para Express que carrega certificados SSL
 */
export function getSSLOptions() {
  const manager = new LetsEncryptManager();
  const config = manager.getCertificateConfig("vyaconcept.com.br");

  if (!config) {
    console.warn("[SSL] Certificados não encontrados. Usando HTTP sem SSL.");
    return null;
  }

  return {
    key: fs.readFileSync(config.keyPath),
    cert: fs.readFileSync(config.certPath),
  };
}

/**
 * Verificar e renovar certificados periodicamente
 */
export async function setupCertificateRenewal() {
  const manager = new LetsEncryptManager();

  // Verificar a cada 24 horas
  setInterval(async () => {
    console.log("[Let's Encrypt] Verificando certificados...");

    const certificates = manager.listAvailableCertificates();
    for (const cert of certificates) {
      if (manager.isCertificateExpiringSoon(cert)) {
        console.warn(`[Let's Encrypt] Certificado expirando em breve: ${cert}`);
        await manager.renewCertificate(cert);
      }
    }
  }, 24 * 60 * 60 * 1000); // 24 horas

  console.log("[Let's Encrypt] Verificação de certificados agendada a cada 24 horas");
}

/**
 * Configuração de ACME Challenge para Let's Encrypt
 * Usado para validação DNS
 */
export interface ACMEChallenge {
  domain: string;
  token: string;
  keyAuthorization: string;
  type: "dns-01" | "http-01";
}

export class ACMEManager {
  /**
   * Processar desafio ACME DNS
   */
  async handleDNSChallenge(challenge: ACMEChallenge): Promise<boolean> {
    console.log(`[ACME] Processando desafio DNS para ${challenge.domain}`);
    console.log(`[ACME] Token: ${challenge.token}`);
    console.log(`[ACME] Autorização: ${challenge.keyAuthorization}`);

    // Aqui você deve:
    // 1. Criar um registro TXT no DNS com o valor keyAuthorization
    // 2. Aguardar propagação DNS
    // 3. Retornar true quando validado

    // Exemplo com AWS Route53:
    // await createDNSRecord('_acme-challenge', challenge.keyAuthorization);
    // await waitForDNSPropagation();

    return true;
  }

  /**
   * Processar desafio ACME HTTP
   */
  async handleHTTPChallenge(challenge: ACMEChallenge): Promise<boolean> {
    console.log(`[ACME] Processando desafio HTTP para ${challenge.domain}`);

    // Aqui você deve:
    // 1. Servir o arquivo .well-known/acme-challenge/{token}
    // 2. Conteúdo: keyAuthorization
    // 3. Let's Encrypt fará uma requisição GET

    // Exemplo com Express:
    // app.get('/.well-known/acme-challenge/:token', (req, res) => {
    //   if (req.params.token === challenge.token) {
    //     res.send(challenge.keyAuthorization);
    //   }
    // });

    return true;
  }
}

export const acmeManager = new ACMEManager();
