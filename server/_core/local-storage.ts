/**
 * Storage Local para Desenvolvimento
 * 
 * Permite usar o disco rígido local em vez de AWS S3
 * Útil para desenvolvimento e testes sem dependências externas
 */

import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { ENV } from "./env";

/**
 * Inicializar pasta de uploads local
 */
export function initializeLocalStorage(): void {
  if (!ENV.useLocalStorage) return;

  const uploadPath = ENV.localStoragePath;
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log(`[Local Storage] Pasta criada: ${uploadPath}`);
  }
}

/**
 * Upload de arquivo para storage local
 * 
 * @param data Buffer ou string do arquivo
 * @param filename Nome do arquivo
 * @param contentType Tipo MIME
 * @returns Objeto com key e url
 */
export async function uploadToLocalStorage(
  data: Buffer | string,
  filename: string,
  contentType?: string
): Promise<{ key: string; url: string }> {
  if (!ENV.useLocalStorage) {
    throw new Error("Local storage não está ativado");
  }

  try {
    // Gerar nome único para o arquivo
    const fileExtension = path.extname(filename);
    const uniqueFilename = `${nanoid()}${fileExtension}`;
    const filePath = path.join(ENV.localStoragePath, uniqueFilename);

    // Converter string para Buffer se necessário
    const buffer = typeof data === "string" ? Buffer.from(data) : data;

    // Salvar arquivo
    fs.writeFileSync(filePath, buffer);

    // URL relativa para acessar o arquivo
    const url = `/uploads/${uniqueFilename}`;

    console.log(
      `[Local Storage] Arquivo salvo: ${uniqueFilename} (${buffer.length} bytes)`
    );

    return {
      key: uniqueFilename,
      url,
    };
  } catch (error) {
    console.error("[Local Storage] Erro ao fazer upload:", error);
    throw new Error(`Erro ao fazer upload: ${String(error)}`);
  }
}

/**
 * Baixar arquivo do storage local
 * 
 * @param key Nome do arquivo
 * @returns Buffer do arquivo
 */
export async function downloadFromLocalStorage(key: string): Promise<Buffer> {
  if (!ENV.useLocalStorage) {
    throw new Error("Local storage não está ativado");
  }

  try {
    const filePath = path.join(ENV.localStoragePath, key);

    // Validar que o arquivo está dentro da pasta de uploads
    const resolvedPath = path.resolve(filePath);
    const uploadDir = path.resolve(ENV.localStoragePath);
    if (!resolvedPath.startsWith(uploadDir)) {
      throw new Error("Acesso negado: arquivo fora da pasta de uploads");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${key}`);
    }

    const data = fs.readFileSync(filePath);
    console.log(`[Local Storage] Arquivo baixado: ${key} (${data.length} bytes)`);

    return data;
  } catch (error) {
    console.error("[Local Storage] Erro ao baixar:", error);
    throw new Error(`Erro ao baixar arquivo: ${String(error)}`);
  }
}

/**
 * Deletar arquivo do storage local
 * 
 * @param key Nome do arquivo
 */
export async function deleteFromLocalStorage(key: string): Promise<void> {
  if (!ENV.useLocalStorage) {
    throw new Error("Local storage não está ativado");
  }

  try {
    const filePath = path.join(ENV.localStoragePath, key);

    // Validar que o arquivo está dentro da pasta de uploads
    const resolvedPath = path.resolve(filePath);
    const uploadDir = path.resolve(ENV.localStoragePath);
    if (!resolvedPath.startsWith(uploadDir)) {
      throw new Error("Acesso negado: arquivo fora da pasta de uploads");
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`[Local Storage] Arquivo deletado: ${key}`);
    }
  } catch (error) {
    console.error("[Local Storage] Erro ao deletar:", error);
    throw new Error(`Erro ao deletar arquivo: ${String(error)}`);
  }
}

/**
 * Listar arquivos no storage local
 * 
 * @returns Array com nomes dos arquivos
 */
export async function listLocalStorageFiles(): Promise<string[]> {
  if (!ENV.useLocalStorage) {
    throw new Error("Local storage não está ativado");
  }

  try {
    if (!fs.existsSync(ENV.localStoragePath)) {
      return [];
    }

    const files = fs.readdirSync(ENV.localStoragePath);
    console.log(`[Local Storage] ${files.length} arquivos encontrados`);

    return files;
  } catch (error) {
    console.error("[Local Storage] Erro ao listar:", error);
    throw new Error(`Erro ao listar arquivos: ${String(error)}`);
  }
}

/**
 * Obter informações do arquivo
 * 
 * @param key Nome do arquivo
 * @returns Objeto com informações do arquivo
 */
export async function getLocalStorageFileInfo(
  key: string
): Promise<{ size: number; created: Date; modified: Date }> {
  if (!ENV.useLocalStorage) {
    throw new Error("Local storage não está ativado");
  }

  try {
    const filePath = path.join(ENV.localStoragePath, key);

    // Validar que o arquivo está dentro da pasta de uploads
    const resolvedPath = path.resolve(filePath);
    const uploadDir = path.resolve(ENV.localStoragePath);
    if (!resolvedPath.startsWith(uploadDir)) {
      throw new Error("Acesso negado: arquivo fora da pasta de uploads");
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${key}`);
    }

    const stats = fs.statSync(filePath);

    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
    };
  } catch (error) {
    console.error("[Local Storage] Erro ao obter info:", error);
    throw new Error(`Erro ao obter informações: ${String(error)}`);
  }
}
