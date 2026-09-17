import { prisma } from '../utils/prisma.js';
import { AppError, assertFound } from '../utils/errors.js';
import { slugify } from '../utils/shop.js';
import { parsePrintEditions, parsePrintSizes, type PrintEdition, type PrintSize } from '../utils/print.js';

export type ProductInput = {
  title: string;
  description: string;
  priceCents: number;
  category?: string;
  stock?: number;
  featured?: boolean;
  published?: boolean;
  format?: string;
  sizes?: PrintSize[];
  editions?: PrintEdition[];
  frame?: string;
  slug?: string;
};

function present<T extends { sizes: string; editions: string }>(product: T) {
  return { ...product, sizes: parsePrintSizes(product.sizes), editions: parsePrintEditions(product.editions) };
}

export class ProductService {
  async listPublic(filters?: { category?: string; featured?: boolean }) {
    const products = await prisma.product.findMany({
      where: {
        published: true,
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.featured ? { featured: true } : {}),
      },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });
    return products.map(present);
  }

  async getPublicBySlug(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, published: true },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    return present(assertFound(product, 'Ilustración no encontrada'));
  }

  async listAdmin() {
    const products = await prisma.product.findMany({
      include: { images: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
    return products.map(present);
  }

  async getAdmin(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    });
    return present(assertFound(product, 'Producto no encontrado'));
  }

  async create(input: ProductInput) {
    const slug = input.slug ? slugify(input.slug, false) : slugify(input.title);
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists) {
      throw new AppError(409, 'Ya hay un producto con esa URL', 'SLUG_TAKEN');
    }
    const sizes = input.sizes ?? [];
    const editions = input.editions ?? [];
    const product = await prisma.product.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        priceCents: sizes.length ? Math.min(...sizes.map((size) => size.priceCents)) : input.priceCents,
        category: input.category ?? 'print',
        stock: input.stock ?? 12,
        featured: input.featured ?? false,
        published: input.published ?? true,
        format: sizes.length ? sizes.map((size) => size.label).join(' / ') : (input.format ?? 'Print A4'),
        sizes: JSON.stringify(sizes),
        editions: JSON.stringify(editions),
        frame: input.frame ?? 'portrait',
      },
      include: { images: true },
    });
    return present(product);
  }

  async update(id: string, input: Partial<ProductInput>) {
    await this.getAdmin(id);
    const { sizes, editions, slug, title, ...rest } = input;
    const data: Record<string, unknown> = { ...rest };
    if (slug) {
      data.slug = slugify(slug, false);
    }
    if (title) {
      data.title = title;
    }
    if (sizes) {
      data.sizes = JSON.stringify(sizes);
      data.format = sizes.map((size) => size.label).join(' / ');
      data.priceCents = Math.min(...sizes.map((size) => size.priceCents));
    }
    if (editions) {
      data.editions = JSON.stringify(editions);
    }
    try {
      const product = await prisma.product.update({
        where: { id },
        data,
        include: { images: { orderBy: { sortOrder: 'asc' } } },
      });
      return present(product);
    } catch {
      throw new AppError(409, 'No se pudo guardar. Revisa la URL.', 'UPDATE_FAILED');
    }
  }

  async remove(id: string) {
    await this.getAdmin(id);
    await prisma.product.delete({ where: { id } });
  }

  async addImage(productId: string, url: string, alt: string) {
    await this.getAdmin(productId);
    const last = await prisma.productImage.findFirst({
      where: { productId },
      orderBy: { sortOrder: 'desc' },
    });
    return prisma.productImage.create({
      data: {
        productId,
        url,
        alt,
        sortOrder: (last?.sortOrder ?? -1) + 1,
      },
    });
  }

  async removeImage(productId: string, imageId: string) {
    const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
    assertFound(image, 'Imagen no encontrada');
    await prisma.productImage.delete({ where: { id: imageId } });
  }
}

export const productService = new ProductService();
