import type { Request, Response } from 'express';
import { orderService } from '../services/orderService.js';
import { checkoutSchema, updateOrderStatusSchema } from '../validators/schemas.js';
import { AppError } from '../utils/errors.js';

export class OrderController {
  checkout = async (req: Request, res: Response) => {
    const body = checkoutSchema.parse(req.body);
    const order = await orderService.checkout(body);
    res.status(201).json({ order });
  };

  receipt = async (req: Request, res: Response) => {
    const token = typeof req.query.t === 'string' ? req.query.t : '';
    if (!token) {
      throw new AppError(400, 'Falta el comprobante', 'MISSING_TOKEN');
    }
    const order = await orderService.getByReceipt(String(req.params.number), token);
    if (!order) {
      throw new AppError(404, 'No encontramos ese pedido', 'NOT_FOUND');
    }
    res.json({ order });
  };

  listAdmin = async (_req: Request, res: Response) => {
    const orders = await orderService.listAdmin();
    res.json({ orders });
  };

  getAdmin = async (req: Request, res: Response) => {
    const order = await orderService.getAdmin(String(req.params.id));
    res.json({ order });
  };

  updateStatus = async (req: Request, res: Response) => {
    const body = updateOrderStatusSchema.parse(req.body);
    const order = await orderService.updateStatus(String(req.params.id), body.status);
    res.json({ order });
  };

  stats = async (_req: Request, res: Response) => {
    const stats = await orderService.stats();
    res.json({ stats });
  };
}

export const orderController = new OrderController();
