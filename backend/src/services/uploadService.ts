import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from '../utils/env.js';
import { AppError } from '../utils/errors.js';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export class UploadService {
  async ensureDirs() {
    await fs.mkdir(path.join(env.UPLOAD_DIR, 'products'), { recursive: true });
  }

  async saveProductImage(file: Express.Multer.File) {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new AppError(400, 'Usa JPG, PNG, WEBP o GIF', 'INVALID_MIME');
    }
    if (file.size > env.MAX_UPLOAD_BYTES) {
      throw new AppError(400, 'La imagen es demasiado grande (máx. 8 MB)', 'FILE_TOO_LARGE');
    }
    await this.ensureDirs();
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const storageKey = `products/${randomUUID()}${ext}`;
    const fullPath = path.join(env.UPLOAD_DIR, storageKey);
    await fs.writeFile(fullPath, file.buffer);
    return { storageKey, url: `/uploads/${storageKey}` };
  }

  resolvePath(storageKey: string) {
    const resolved = path.resolve(env.UPLOAD_DIR, storageKey);
    const root = path.resolve(env.UPLOAD_DIR);
    if (!resolved.startsWith(root)) {
      throw new AppError(400, 'Ruta inválida', 'INVALID_PATH');
    }
    return resolved;
  }
}

export const uploadService = new UploadService();
