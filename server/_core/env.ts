export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  
  // Modo de Desenvolvimento Local
  isDevelopment: process.env.NODE_ENV === "development",
  authBypass: process.env.AUTH_BYPASS === "true",
  adminLocalOpenId: process.env.ADMIN_LOCAL_OPEN_ID ?? "admin_local",
  
  // Storage Local vs AWS S3
  useLocalStorage: process.env.USE_LOCAL_STORAGE === "true",
  localStoragePath: process.env.LOCAL_STORAGE_PATH ?? "./uploads",
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  awsS3Bucket: process.env.AWS_S3_BUCKET ?? "",
  awsS3Region: process.env.AWS_S3_REGION ?? "sa-east-1",
};
