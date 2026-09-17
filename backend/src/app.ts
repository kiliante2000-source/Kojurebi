import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { env } from './utils/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './routes/authRoutes.js';
import { catalogRouter, adminProductRouter } from './routes/productRoutes.js';
import { checkoutRouter, adminOrderRouter } from './routes/orderRoutes.js';
import { uploadService } from './services/uploadService.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '4mb' }));
  app.use(cookieParser());
  app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'kojurebi-api', env: env.NODE_ENV });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/catalog', catalogRouter);
  app.use('/api', checkoutRouter);
  app.use('/api/admin/products', adminProductRouter);
  app.use('/api/admin/orders', adminOrderRouter);

  app.use(errorHandler);
  return app;
}

export async function bootstrap() {
  await uploadService.ensureDirs();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`Kojurebi API listening on http://127.0.0.1:${env.PORT}`);
  });
}
