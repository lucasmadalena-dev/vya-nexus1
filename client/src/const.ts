export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  
  // Validação: se as variáveis não estão definidas, mostrar erro claro
  if (!oauthPortalUrl) {
    console.error(
      "[Vya Nexus] Erro de configuração: VITE_OAUTH_PORTAL_URL não está definido.\n" +
      "Verifique se o arquivo .env está na raiz do projeto com:\n" +
      "VITE_OAUTH_PORTAL_URL=https://portal.manus.im"
    );
    throw new Error(
      "VITE_OAUTH_PORTAL_URL não configurado. Verifique o arquivo .env na raiz do projeto."
    );
  }
  
  if (!appId) {
    console.error(
      "[Vya Nexus] Erro de configuração: VITE_APP_ID não está definido.\n" +
      "Verifique se o arquivo .env está na raiz do projeto com:\n" +
      "VITE_APP_ID=seu_app_id_aqui"
    );
    throw new Error(
      "VITE_APP_ID não configurado. Verifique o arquivo .env na raiz do projeto."
    );
  }
  
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");

    return url.toString();
  } catch (error) {
    console.error(
      "[Vya Nexus] Erro ao construir URL de login:",
      error,
      "\nVITE_OAUTH_PORTAL_URL:",
      oauthPortalUrl
    );
    throw new Error(
      `Erro ao construir URL de login. VITE_OAUTH_PORTAL_URL inválido: ${oauthPortalUrl}`
    );
  }
};

// Função auxiliar para verificar se todas as variáveis obrigatórias estão configuradas
export const validateEnvVariables = () => {
  const required = {
    VITE_APP_ID: import.meta.env.VITE_APP_ID,
    VITE_OAUTH_PORTAL_URL: import.meta.env.VITE_OAUTH_PORTAL_URL,
    VITE_STRIPE_PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  };

  const missing = Object.entries(required)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    console.warn(
      "[Vya Nexus] Variáveis de ambiente faltando:",
      missing,
      "\nCertifique-se de que o arquivo .env está na raiz do projeto."
    );
    return false;
  }

  return true;
};
