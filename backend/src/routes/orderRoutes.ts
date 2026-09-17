import { Router } from 'express';
import { orderController } from '../controllers/orderController.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { rateLimitAuth } from '../middleware/rateLimit.js';

export const checkoutRouter = Router();
checkoutRouter.post('/checkout', rateLimitAuth, orderController.checkout);
checkoutRouter.get('/orders/:number', orderController.receipt);

export const adminOrderRouter = Router();
adminOrderRouter.use(requireAuth, requireAdmin);
adminOrderRouter.get('/', orderController.listAdmin);
adminOrderRouter.get('/stats', orderController.stats);
adminOrderRouter.get('/:id', orderController.getAdmin);
adminOrderRouter.patch('/:id', orderController.updateStatus);
