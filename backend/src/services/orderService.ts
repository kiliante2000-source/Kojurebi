import { randomUUID } from 'node:crypto';
import { prisma } from '../utils/prisma.js';
import { AppError, assertFound } from '../utils/errors.js';
import { makeOrderNumber, shippingCentsFor } from '../utils/shop.js';
import { parsePrintSizes, printLineTitle, resolvePrintEdition, resolvePrintSize } from '../utils/print.js';
import type { checkoutSchema } from '../validators/schemas.js';
import type { z } from 'zod';

type CheckoutBody = z.infer<typeof checkoutSchema>;

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function parseExpiry(expiry: string) {
  const [mm, yy] = expiry.split('/').map((part) => Number(part));
  if (!mm || !yy || mm < 1 || mm > 12) {
    throw new AppError(400, 'La fecha de caducidad no es válida', 'INVALID_CARD');
  }
  const year = 2000 + yy;
  const end = new Date(year, mm, 0, 23, 59, 59);
  if (end.getTime() < Date.now()) {
    throw new AppError(400, 'La tarjeta está caducada', 'CARD_EXPIRED');
  }
}

function chargeCard(cardNumber: string) {
  const number = digitsOnly(cardNumber);
  if (number.length < 13 || number.length > 19) {
    throw new AppError(400, 'El número de tarjeta no es válido', 'INVALID_CARD');
  }
  if (number.startsWith('4000000000000002') || number === '4000000000000002') {
    throw new AppError(402, 'El pago fue rechazado por el banco', 'PAYMENT_DECLINED');
  }
  return number.slice(-4);
}

export class OrderService {
  async checkout(body: CheckoutBody) {
    parseExpiry(body.payment.expiry);
    if (!/^\d{3,4}$/.test(body.payment.cvc)) {
      throw new AppError(400, 'El CVC no es válido', 'INVALID_CARD');
    }
    const last4 = chargeCard(body.payment.cardNumber);

    const uniqueIds = [...new Set(body.items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: uniqueIds }, published: true },
      include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } },
    });
    if (products.length !== uniqueIds.length) {
      throw new AppError(400, 'Alguna ilustración ya no está disponible', 'PRODUCT_UNAVAILABLE');
    }

    const byId = new Map(products.map((p) => [p.id, p]));
    let subtotalCents = 0;
    const snapshots = body.items.map((item) => {
      const product = byId.get(item.productId)!;
      if (product.stock < item.quantity) {
        throw new AppError(409, `No quedan suficientes unidades de “${product.title}”`, 'OUT_OF_STOCK');
      }
      const size = resolvePrintSize(product, item.size);
      const edition = resolvePrintEdition(product, item.edition);
      subtotalCents += size.priceCents * item.quantity;
      return {
        product,
        quantity: item.quantity,
        size,
        edition,
      };
    });

    const shippingCents = shippingCentsFor(subtotalCents);
    const totalCents = subtotalCents + shippingCents;
    const number = makeOrderNumber();
    const receiptToken = randomUUID();

    const order = await prisma.$transaction(async (tx) => {
      for (const snap of snapshots) {
        const updated = await tx.product.updateMany({
          where: { id: snap.product.id, stock: { gte: snap.quantity } },
          data: { stock: { decrement: snap.quantity } },
        });
        if (updated.count !== 1) {
          throw new AppError(409, `No quedan suficientes unidades de “${snap.product.title}”`, 'OUT_OF_STOCK');
        }
      }

      return tx.order.create({
        data: {
          number,
          receiptToken,
          status: 'paid',
          email: body.email.toLowerCase(),
          customerName: body.customerName,
          phone: body.phone || null,
          addressLine1: body.addressLine1,
          addressLine2: body.addressLine2 || null,
          city: body.city,
          postalCode: body.postalCode,
          province: body.province || null,
          country: body.country || 'España',
          notes: body.notes || null,
          paymentMethod: 'card',
          paymentLast4: last4,
          subtotalCents,
          shippingCents,
          totalCents,
          items: {
            create: snapshots.map((snap) => ({
              productId: snap.product.id,
              title: printLineTitle(
                snap.product.title,
                snap.edition?.label,
                parsePrintSizes(snap.product.sizes).length ? snap.size.label : undefined,
              ),
              slug: snap.product.slug,
              imageUrl: snap.edition?.url ?? snap.product.images[0]?.url ?? null,
              unitCents: snap.size.priceCents,
              quantity: snap.quantity,
            })),
          },
        },
        include: { items: true },
      });
    });

    return order;
  }

  getByReceipt(number: string, token: string) {
    return prisma.order.findFirst({
      where: { number, receiptToken: token },
      include: { items: true },
    });
  }

  listAdmin() {
    return prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAdmin(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return assertFound(order, 'Pedido no encontrado');
  }

  async updateStatus(id: string, status: string) {
    await this.getAdmin(id);
    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }

  async stats() {
    const [productCount, orderCount, paidAgg, pendingShip] = await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalCents: true } }),
      prisma.order.count({ where: { status: { in: ['paid', 'packing'] } } }),
    ]);
    return {
      productCount,
      orderCount,
      revenueCents: paidAgg._sum.totalCents ?? 0,
      toFulfill: pendingShip,
    };
  }
}

export const orderService = new OrderService();
