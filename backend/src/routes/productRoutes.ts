import { Router } from 'express';
import multer from 'multer';
import { productController } from '../controllers/productController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { env } from '../utils/env.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.MAX_UPLOAD_BYTES },
});

export const catalogRouter = Router();
catalogRouter.get('/products', productController.listPublic);
catalogRouter.get('/products/:slug', productController.getPublic);

export const adminProductRouter = Router();
adminProductRouter.use(requireAuth, requireAdmin);
adminProductRouter.get('/', productController.listAdmin);
adminProductRouter.post('/', productController.create);
adminProductRouter.get('/:id', productController.getAdmin);
adminProductRouter.patch('/:id', productController.update);
adminProductRouter.delete('/:id', productController.remove);
adminProductRouter.post('/:id/images', upload.single('file'), productController.uploadImage);
adminProductRouter.delete('/:id/images/:imageId', productController.removeImage);
