import type { Request, Response } from 'express';
import { productService } from '../services/productService.js';
import { uploadService } from '../services/uploadService.js';
import { productSchema, updateProductSchema } from '../validators/schemas.js';
import { AppError } from '../utils/errors.js';

export class ProductController {
  listPublic = async (req: Request, res: Response) => {
    const category = typeof req.query.category === 'string' ? req.query.category : undefined;
    const featured = req.query.featured === 'true';
    const products = await productService.listPublic({
      category,
      featured: featured || undefined,
    });
    res.json({ products });
  };

  getPublic = async (req: Request, res: Response) => {
    const product = await productService.getPublicBySlug(String(req.params.slug));
    res.json({ product });
  };

  listAdmin = async (_req: Request, res: Response) => {
    const products = await productService.listAdmin();
    res.json({ products });
  };

  getAdmin = async (req: Request, res: Response) => {
    const product = await productService.getAdmin(String(req.params.id));
    res.json({ product });
  };

  create = async (req: Request, res: Response) => {
    const body = productSchema.parse(req.body);
    const product = await productService.create(body);
    res.status(201).json({ product });
  };

  update = async (req: Request, res: Response) => {
    const body = updateProductSchema.parse(req.body);
    const product = await productService.update(String(req.params.id), body);
    res.json({ product });
  };

  remove = async (req: Request, res: Response) => {
    await productService.remove(String(req.params.id));
    res.status(204).end();
  };

  uploadImage = async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      throw new AppError(400, 'Sube una imagen', 'FILE_REQUIRED');
    }
    const saved = await uploadService.saveProductImage(file);
    const image = await productService.addImage(
      String(req.params.id),
      saved.url,
      typeof req.body.alt === 'string' ? req.body.alt : '',
    );
    res.status(201).json({ image });
  };

  removeImage = async (req: Request, res: Response) => {
    await productService.removeImage(String(req.params.id), String(req.params.imageId));
    res.status(204).end();
  };
}

export const productController = new ProductController();
