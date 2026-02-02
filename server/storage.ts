// Storage com suporte a Local Storage (desenvolvimento) e AWS S3 (produção)

import { ENV } from './_core/env';
import * as localStorageModule from './_core/local-storage';

type StorageConfig = { baseUrl: string; apiKey: string };

/**
 * Determinar qual storage usar baseado na configuração
 */
function shouldUseLocalStorage(): boolean {
  return ENV.isDevelopment && ENV.useLocalStorage;
}

/**
 * Configuração do storage remoto (AWS S3)
 */
function getStorageConfig(): StorageConfig {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;

  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }

  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}

function buildUploadUrl(baseUrl: string, relKey: string): URL {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}

async function buildDownloadUrl(
  baseUrl: string,
  relKey: string,
  apiKey: string
): Promise<string> {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey),
  });
  return (await response.json()).url;
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function toFormData(
  data: Buffer | Uint8Array | string,
  contentType: string,
  fileName: string
): FormData {
  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}

function buildAuthHeaders(apiKey: string): HeadersInit {
  return { Authorization: `Bearer ${apiKey}` };
}

/**
 * Upload de arquivo para storage (local ou remoto)
 * 
 * @param relKey Caminho relativo do arquivo
 * @param data Buffer, Uint8Array ou string
 * @param contentType Tipo MIME
 * @returns Objeto com key e url
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  // Usar storage local em desenvolvimento
  if (shouldUseLocalStorage()) {
    console.log(`[Storage] Usando LOCAL STORAGE para: ${relKey}`);
    const filename = relKey.split("/").pop() || "file";
    const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    return await localStorageModule.uploadToLocalStorage(buffer, filename, contentType);
  }

  // Usar AWS S3 em produção
  console.log(`[Storage] Usando AWS S3 para: ${relKey}`);
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}

/**
 * Obter URL de download de arquivo
 * 
 * @param relKey Caminho relativo do arquivo
 * @returns Objeto com key e url
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  // Usar storage local em desenvolvimento
  if (shouldUseLocalStorage()) {
    console.log(`[Storage] Obtendo URL local para: ${relKey}`);
    const filename = relKey.split("/").pop() || "file";
    return {
      key: filename,
      url: `/uploads/${filename}`,
    };
  }

  // Usar AWS S3 em produção
  console.log(`[Storage] Obtendo URL S3 para: ${relKey}`);
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey),
  };
}

/**
 * Deletar arquivo do storage
 * 
 * @param relKey Caminho relativo do arquivo
 */
export async function storageDelete(relKey: string): Promise<void> {
  // Usar storage local em desenvolvimento
  if (shouldUseLocalStorage()) {
    console.log(`[Storage] Deletando arquivo local: ${relKey}`);
    const filename = relKey.split("/").pop() || "file";
    await localStorageModule.deleteFromLocalStorage(filename);
    return;
  }

  // Nota: AWS S3 delete não está implementado aqui
  // Adicione conforme necessário
  console.warn(`[Storage] Delete não implementado para AWS S3`);
}

/**
 * Inicializar storage (criar pastas necessárias, etc)
 */
export function initializeStorage(): void {
  if (shouldUseLocalStorage()) {
    console.log(`[Storage] Inicializando LOCAL STORAGE`);
    localStorageModule.initializeLocalStorage();
  } else {
    console.log(`[Storage] Usando AWS S3`);
  }
}
