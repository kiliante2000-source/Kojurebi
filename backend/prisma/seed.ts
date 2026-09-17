import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const A5_A4 = JSON.stringify([
  { label: 'A5', priceCents: 800 },
  { label: 'A4', priceCents: 1200 },
]);

const A5_A4_A3 = JSON.stringify([
  { label: 'A5', priceCents: 800 },
  { label: 'A4', priceCents: 1200 },
  { label: 'A3', priceCents: 1600 },
]);

const HOWL_EDITIONS = JSON.stringify([
  {
    label: 'Noche oscura',
    url: '/shop/prints/howl-noche-clara.png',
  },
  {
    label: 'Estrellas fugaces',
    url: '/shop/prints/howl-estrellas.png',
  },
]);

const products = [
  {
    title: 'Shaymin',
    slug: 'shaymin',
    description:
      'Pack de dos pegatinas de Shaymin: una viñeta en el prado con borde ondulado y un recorte para el portátil o el sketchbook. La foto del campo de flores es solo ambiente, para verlo en un espacio real: no va en el pack.',
    priceCents: 400,
    category: 'sticker',
    stock: 60,
    featured: true,
    format: 'Pack de 2',
    frame: 'square',
    images: [
      { url: '/shop/stickers/shaymin-vineta.png', alt: 'Pegatina Shaymin, viñeta floral' },
      { url: '/shop/stickers/shaymin-troquel.png', alt: 'Pegatina Shaymin, recorte' },
      { url: '/shop/stickers/shaymin-campo.png', alt: 'Shaymin en un campo de flores, foto de ambiente' },
    ],
  },
  {
    title: 'Jirachi',
    slug: 'jirachi',
    description:
      'Pack de dos pegatinas de Jirachi: una viñeta de luna y estrellas con borde ondulado y un recorte para el portátil o el sketchbook. La foto del cielo estrellado es solo ambiente, para verlo en un espacio real: no va en el pack.',
    priceCents: 400,
    category: 'sticker',
    stock: 60,
    featured: true,
    format: 'Pack de 2',
    frame: 'square',
    images: [
      { url: '/shop/stickers/jirachi-vineta.png', alt: 'Pegatina Jirachi, viñeta estelar' },
      { url: '/shop/stickers/jirachi-troquel.png', alt: 'Pegatina Jirachi, recorte' },
      { url: '/shop/stickers/jirachi-cielo.png', alt: 'Jirachi en un cielo de estrellas, foto de ambiente' },
    ],
  },
  {
    title: 'Manaphy',
    slug: 'manaphy',
    description:
      'Pack de dos pegatinas de Manaphy: una viñeta bajo el mar con borde ondulado y un recorte para el portátil o el sketchbook. La foto del arrecife es solo ambiente, para verlo en un espacio real: no va en el pack.',
    priceCents: 400,
    category: 'sticker',
    stock: 60,
    featured: true,
    format: 'Pack de 2',
    frame: 'square',
    images: [
      { url: '/shop/stickers/manaphy-vineta.png', alt: 'Pegatina Manaphy, viñeta marina' },
      { url: '/shop/stickers/manaphy-troquel.png', alt: 'Pegatina Manaphy, recorte' },
      { url: '/shop/stickers/manaphy-mar.png', alt: 'Manaphy en un arrecife, foto de ambiente' },
    ],
  },
  {
    title: 'Celebi',
    slug: 'celebi',
    description:
      'Pack de dos pegatinas de Celebi: una viñeta floral con borde ondulado y un recorte para el portátil o el sketchbook. La foto del campo de flores es solo ambiente, para verlo en un espacio real: no va en el pack.',
    priceCents: 400,
    category: 'sticker',
    stock: 60,
    featured: true,
    format: 'Pack de 2',
    frame: 'square',
    images: [
      { url: '/shop/stickers/celebi-vineta.jpg', alt: 'Pegatina Celebi, viñeta floral' },
      { url: '/shop/stickers/celebi-troquel.png', alt: 'Pegatina Celebi, recorte' },
      { url: '/shop/stickers/celebi-campo.jpg', alt: 'Celebi en un campo de flores, foto de ambiente' },
    ],
  },
  {
    title: 'Chica Sol',
    slug: 'chica-sol',
    description:
      'Original del estudio: una chica de fuego quieto, rayos amarillos y un corazón en el pecho. Tinta y color sobre papel crema, con el grano de Kojurebi. A5 para la mesa, A4 para la pared, A3 si lo quieres más grande.',
    priceCents: 800,
    category: 'original',
    stock: 20,
    featured: true,
    format: 'A5 / A4 / A3',
    sizes: A5_A4_A3,
    frame: 'portrait',
    images: [{ url: '/shop/prints/chica-sol.png', alt: 'Original Chica Sol, retrato solar de Kojurebi' }],
  },
  {
    title: 'Howl',
    slug: 'howl',
    description:
      'Howl sopla magia a la noche: capa de fuego, pelo cobalto y un cielo lleno de fugas. Es el mismo dibujo en dos cielos —uno más oscuro y de contraste, otro más de color y estrellas fugaces— para que elijas el que te llegue. A5 para la mesa, A4 para la pared, A3 si lo quieres más grande.',
    priceCents: 800,
    category: 'print',
    stock: 20,
    featured: true,
    format: 'A5 / A4 / A3',
    sizes: A5_A4_A3,
    editions: HOWL_EDITIONS,
    frame: 'landscape',
    images: [
      { url: '/shop/prints/howl-noche-clara.png', alt: 'Howl, versión noche oscura' },
      { url: '/shop/prints/howl-estrellas.png', alt: 'Howl, versión estrellas fugaces' },
    ],
  },
  {
    title: 'Diamante blanco',
    slug: 'diamante-blanco',
    description:
      'Gema de luz, pestañas de tinta y un corazón rosa entre las manos. Diamante blanco con espiral bubblegum, impresa con grano de lápiz sobre papel crema. A5 para la mesa, A4 para la pared, A3 si lo quieres más grande.',
    priceCents: 800,
    category: 'print',
    stock: 20,
    featured: true,
    format: 'A5 / A4 / A3',
    sizes: A5_A4_A3,
    frame: 'portrait',
    images: [{ url: '/shop/prints/diamante-blanco.png', alt: 'Print Diamante blanco, gema de luz de Kojurebi' }],
  },
  {
    title: 'Ópalo',
    slug: 'opalo',
    description:
      'Cuatro brazos, luna y pelo de nubes. Ópalo en lila, cobalto y destellos, impresa con grano de lápiz sobre papel crema. Elige A5 para el escritorio, A4 para la pared o A3 si lo quieres más grande.',
    priceCents: 800,
    category: 'print',
    stock: 20,
    featured: true,
    format: 'A5 / A4 / A3',
    sizes: A5_A4_A3,
    frame: 'portrait',
    images: [{ url: '/shop/prints/opalo.png', alt: 'Print Ópalo, fusión lunar de Kojurebi' }],
  },
  {
    title: 'Lilimon',
    slug: 'lilimon',
    description:
      'Hada flor en rosa chicle y hojas lima. Pétalos, zarcillos y un poco de veneno dulce, dibujados con grano de lápiz sobre papel crema. Disponible en A5 y A4.',
    priceCents: 800,
    category: 'print',
    stock: 20,
    featured: true,
    format: 'A5 / A4',
    sizes: A5_A4,
    frame: 'landscape',
    images: [{ url: '/shop/prints/lilimon.png', alt: 'Print Lilimon, hada floral de Kojurebi' }],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash('kojurebi1234', 12);

  await prisma.user.upsert({
    where: { email: 'estudio@kojurebi.com' },
    update: { passwordHash, role: 'admin', name: 'Estudio Kojurebi' },
    create: {
      name: 'Estudio Kojurebi',
      email: 'estudio@kojurebi.com',
      passwordHash,
      role: 'admin',
    },
  });

  for (const item of products) {
    const { images, ...data } = item;
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: data,
      create: data,
    });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.createMany({
      data: images.map((image, index) => ({
        productId: product.id,
        url: image.url,
        alt: image.alt,
        sortOrder: index,
      })),
    });
  }

  await prisma.product.deleteMany({
    where: { slug: { notIn: products.map((item) => item.slug) } },
  });

  console.log('Seed OK — estudio@kojurebi.com / kojurebi1234');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
