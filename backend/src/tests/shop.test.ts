import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createApp } from '../app.js';
import { parsePrintEditions, parsePrintSizes, printLineTitle, resolvePrintEdition, resolvePrintSize } from '../utils/print.js';
import { shippingCentsFor, slugify } from '../utils/shop.js';

const prisma = new PrismaClient();
const app = createApp();

describe('shop utils', () => {
  it('gives free shipping over 40€', () => {
    expect(shippingCentsFor(3999)).toBe(490);
    expect(shippingCentsFor(4000)).toBe(0);
  });

  it('slugifies titles', () => {
    expect(slugify('Cerezas Gemelas', false)).toBe('cerezas-gemelas');
  });

  it('resolves A4 over the listing price', () => {
    const product = {
      format: 'A5 / A4',
      priceCents: 800,
      sizes: JSON.stringify([
        { label: 'A5', priceCents: 800 },
        { label: 'A4', priceCents: 1200 },
      ]),
    };
    expect(parsePrintSizes(product.sizes)).toHaveLength(2);
    expect(resolvePrintSize(product, 'A4').priceCents).toBe(1200);
    expect(resolvePrintSize(product).label).toBe('A4');
  });

  it('keeps Howl editions in the line title', () => {
    const product = {
      editions: JSON.stringify([
        { label: 'Noche oscura', url: '/shop/prints/howl-noche-clara.png' },
        { label: 'Estrellas fugaces', url: '/shop/prints/howl-estrellas.png' },
      ]),
    };
    expect(parsePrintEditions(product.editions)).toHaveLength(2);
    expect(resolvePrintEdition(product, 'Estrellas fugaces')?.label).toBe('Estrellas fugaces');
    expect(printLineTitle('Howl', 'Estrellas fugaces', 'A4')).toBe('Howl · Estrellas fugaces · A4');
  });
});

describe('Kojurebi shop API', () => {
  const email = `admin-${Date.now()}@kojurebi.com`;
  const password = 'testpass123';
  let agent: ReturnType<typeof request.agent>;
  let productId = '';
  let slug = '';

  beforeAll(async () => {
    agent = request.agent(app);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    if (productId) {
      await prisma.product.deleteMany({ where: { id: productId } });
    }
    await prisma.$disconnect();
  });

  it('registers the first admin and returns a session', async () => {
    const res = await agent.post('/api/auth/register').send({
      name: 'Estudio Test',
      email,
      password,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.role).toBe('admin');
  });

  it('creates a product as admin', async () => {
    const res = await agent.post('/api/admin/products').send({
      title: 'Lámina test',
      description: 'Una ilustración de prueba para el catálogo.',
      priceCents: 1500,
      category: 'print',
      stock: 5,
      featured: true,
      published: true,
      format: 'A4',
    });
    expect(res.status).toBe(201);
    productId = res.body.product.id;
    slug = res.body.product.slug;
    expect(res.body.product.title).toBe('Lámina test');
  });

  it('lists the public catalog without login', async () => {
    const res = await request(app).get('/api/catalog/products');
    expect(res.status).toBe(200);
    expect(res.body.products.some((p: { id: string }) => p.id === productId)).toBe(true);
  });

  it('rejects product creation without session', async () => {
    const res = await request(app).post('/api/admin/products').send({
      title: 'Hack',
      description: 'No debería crearse nunca jamás.',
      priceCents: 1000,
    });
    expect(res.status).toBe(401);
  });

  it('checks out as a guest and returns a receipt', async () => {
    const pay = await request(app)
      .post('/api/checkout')
      .send({
        items: [{ productId, quantity: 1 }],
        customerName: 'Marta Dulce',
        email: 'marta@example.com',
        phone: '600000000',
        addressLine1: 'Calle Cereza 12',
        city: 'Valencia',
        postalCode: '46001',
        province: 'Valencia',
        country: 'España',
        payment: {
          cardName: 'Marta Dulce',
          cardNumber: '4242424242424242',
          expiry: '12/32',
          cvc: '123',
        },
      });

    expect(pay.status).toBe(201);
    expect(pay.body.order.number).toMatch(/^KOJ-/);
    expect(pay.body.order.totalCents).toBe(1500 + 490);
    expect(pay.body.order.items).toHaveLength(1);

    const receipt = await request(app).get(
      `/api/orders/${pay.body.order.number}?t=${pay.body.order.receiptToken}`,
    );
    expect(receipt.status).toBe(200);
    expect(receipt.body.order.customerName).toBe('Marta Dulce');
    expect(receipt.body.order.addressLine1).toBe('Calle Cereza 12');
  });

  it('declines the test card', async () => {
    const res = await request(app)
      .post('/api/checkout')
      .send({
        items: [{ productId, quantity: 1 }],
        customerName: 'Marta Dulce',
        email: 'marta@example.com',
        addressLine1: 'Calle Cereza 12',
        city: 'Valencia',
        postalCode: '46001',
        country: 'España',
        payment: {
          cardName: 'Marta Dulce',
          cardNumber: '4000000000000002',
          expiry: '12/32',
          cvc: '123',
        },
      });
    expect(res.status).toBe(402);
  });

  it('shows the product by slug', async () => {
    const res = await request(app).get(`/api/catalog/products/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.product.id).toBe(productId);
  });

  it('checks out a print size at the server price', async () => {
    const created = await agent.post('/api/admin/products').send({
      title: 'Opalo test',
      description: 'Lámina de prueba con dos tamaños de papel.',
      priceCents: 800,
      category: 'print',
      stock: 4,
      featured: false,
      published: true,
      sizes: [
        { label: 'A5', priceCents: 800 },
        { label: 'A4', priceCents: 1200 },
      ],
    });
    expect(created.status).toBe(201);
    const sizedId = created.body.product.id;
    expect(created.body.product.format).toBe('A5 / A4');
    expect(created.body.product.sizes).toEqual([
      { label: 'A5', priceCents: 800 },
      { label: 'A4', priceCents: 1200 },
    ]);

    const pay = await request(app)
      .post('/api/checkout')
      .send({
        items: [{ productId: sizedId, quantity: 1, size: 'A4' }],
        customerName: 'Marta Dulce',
        email: 'marta@example.com',
        addressLine1: 'Calle Cereza 12',
        city: 'Valencia',
        postalCode: '46001',
        country: 'España',
        payment: {
          cardName: 'Marta Dulce',
          cardNumber: '4242424242424242',
          expiry: '12/32',
          cvc: '123',
        },
      });

    expect(pay.status).toBe(201);
    expect(pay.body.order.totalCents).toBe(1200 + 490);
    expect(pay.body.order.items[0].unitCents).toBe(1200);
    expect(pay.body.order.items[0].title).toContain('A4');

    await prisma.product.deleteMany({ where: { id: sizedId } });
  });

  it('checks out a print edition with the chosen sky', async () => {
    const created = await agent.post('/api/admin/products').send({
      title: 'Howl test',
      description: 'Lámina de prueba con dos cielos y dos tamaños.',
      priceCents: 800,
      category: 'print',
      stock: 4,
      featured: false,
      published: true,
      sizes: [
        { label: 'A5', priceCents: 800 },
        { label: 'A4', priceCents: 1200 },
      ],
      editions: [
        { label: 'Noche oscura', url: '/shop/prints/howl-noche-clara.png' },
        { label: 'Estrellas fugaces', url: '/shop/prints/howl-estrellas.png' },
      ],
    });
    expect(created.status).toBe(201);
    const howlId = created.body.product.id;
    expect(created.body.product.editions).toHaveLength(2);

    const pay = await request(app)
      .post('/api/checkout')
      .send({
        items: [{ productId: howlId, quantity: 1, size: 'A5', edition: 'Estrellas fugaces' }],
        customerName: 'Marta Dulce',
        email: 'marta@example.com',
        addressLine1: 'Calle Cereza 12',
        city: 'Valencia',
        postalCode: '46001',
        country: 'España',
        payment: {
          cardName: 'Marta Dulce',
          cardNumber: '4242424242424242',
          expiry: '12/32',
          cvc: '123',
        },
      });

    expect(pay.status).toBe(201);
    expect(pay.body.order.totalCents).toBe(800 + 490);
    expect(pay.body.order.items[0].title).toBe('Howl test · Estrellas fugaces · A5');
    expect(pay.body.order.items[0].imageUrl).toBe('/shop/prints/howl-estrellas.png');

    await prisma.product.deleteMany({ where: { id: howlId } });
  });
});
