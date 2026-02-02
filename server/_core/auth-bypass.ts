/**
 * Middleware de Autenticação com Bypass para Desenvolvimento Local
 * 
 * Permite que desenvolvedores entrem no sistema sem OAuth quando AUTH_BYPASS=true
 * Útil para desenvolvimento local e testes
 */

import type { Request, Response, NextFunction } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import * as db from "../db";
import { sdk } from "./sdk";

/**
 * Middleware que verifica se AUTH_BYPASS está ativo
 * Se sim, cria sessão automática com usuário admin local
 */
export async function authBypassMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Apenas em desenvolvimento
  if (!ENV.isDevelopment || !ENV.authBypass) {
    return next();
  }

  // Se já tem cookie de sessão, deixa passar
  const existingCookie = req.cookies[COOKIE_NAME];
  if (existingCookie) {
    return next();
  }

  try {
    // Verificar se usuário admin local existe no banco
    let adminUser = await db.getUserByOpenId(ENV.adminLocalOpenId);

    // Se não existe, criar automaticamente
    if (!adminUser) {
      console.log(
        `[Auth Bypass] Criando usuário admin local: ${ENV.adminLocalOpenId}`
      );
      await db.upsertUser({
        openId: ENV.adminLocalOpenId,
        name: "Admin Local",
        email: "admin@local.dev",
        loginMethod: "local_dev",
        role: "admin",
      });
      adminUser = await db.getUserByOpenId(ENV.adminLocalOpenId);
    }

    if (!adminUser) {
      console.error("[Auth Bypass] Falha ao criar/recuperar usuário admin");
      return next();
    }

    // Criar token de sessão
    const sessionToken = await sdk.createSessionToken(ENV.adminLocalOpenId, {
      name: adminUser.name || "Admin Local",
      expiresInMs: ONE_YEAR_MS,
    });

    // Definir cookie de sessão
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    console.log(
      `[Auth Bypass] Sessão criada para: ${adminUser.name} (${adminUser.openId})`
    );
  } catch (error) {
    console.error("[Auth Bypass] Erro ao criar sessão:", error);
  }

  next();
}

/**
 * Rota de login local para desenvolvimento
 * GET /api/auth/bypass-login
 * 
 * Retorna URL de redirecionamento para dashboard após criar sessão
 */
export async function bypassLoginRoute(req: Request, res: Response) {
  if (!ENV.isDevelopment || !ENV.authBypass) {
    return res.status(403).json({ error: "Auth bypass não está ativado" });
  }

  try {
    // Verificar/criar usuário admin local
    let adminUser = await db.getUserByOpenId(ENV.adminLocalOpenId);

    if (!adminUser) {
      await db.upsertUser({
        openId: ENV.adminLocalOpenId,
        name: "Admin Local",
        email: "admin@local.dev",
        loginMethod: "local_dev",
        role: "admin",
      });
      adminUser = await db.getUserByOpenId(ENV.adminLocalOpenId);
    }

    // Criar token de sessão
    const sessionToken = await sdk.createSessionToken(ENV.adminLocalOpenId, {
      name: adminUser?.name || "Admin Local",
      expiresInMs: ONE_YEAR_MS,
    });

    // Definir cookie
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(COOKIE_NAME, sessionToken, {
      ...cookieOptions,
      maxAge: ONE_YEAR_MS,
    });

    // Redirecionar para dashboard
    res.redirect(302, "/");
  } catch (error) {
    console.error("[Auth Bypass] Erro ao fazer login:", error);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
}

/**
 * Rota de logout local
 * GET /api/auth/bypass-logout
 */
export function bypassLogoutRoute(req: Request, res: Response) {
  if (!ENV.isDevelopment || !ENV.authBypass) {
    return res.status(403).json({ error: "Auth bypass não está ativado" });
  }

  res.clearCookie(COOKIE_NAME);
  res.redirect(302, "/");
}
