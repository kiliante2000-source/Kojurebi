import { describe, expect, it } from 'vitest';
import {
  defaultPrintSize,
  minPrintPrice,
  mosaicSpan,
  mosaicSpanInList,
  packShopPieces,
  shopMosaicSpan,
  paperAspect,
  parsePrintEditions,
  parsePrintSizes,
  pieceShape,
  printLineTitle,
  selectHomePieces,
  shopDisplayImages,
  shopFrameAspect,
  shopFrameFit,
  sizeHint,
} from './print';
import type { Product } from '../types/shop';

function stubProduct(partial: Partial<Product> & Pick<Product, 'slug' | 'category'>): Product {
  return {
    id: partial.id ?? partial.slug,
    title: partial.title ?? partial.slug,
    description: '',
    priceCents: 1200,
    currency: 'EUR',
    stock: 10,
    featured: true,
    published: true,
    format: 'A5 / A4',
    sizes: [],
    editions: [],
    frame: 'portrait',
    createdAt: '',
    updatedAt: '',
    images: [],
    ...partial,
  };
}

describe('print sizes', () => {
  it('parses A5, A4 and A3', () => {
    expect(
      parsePrintSizes(
        JSON.stringify([
          { label: 'A5', priceCents: 800 },
          { label: 'A4', priceCents: 1200 },
          { label: 'A3', priceCents: 1600 },
        ]),
      ),
    ).toEqual([
      { label: 'A5', priceCents: 800 },
      { label: 'A4', priceCents: 1200 },
      { label: 'A3', priceCents: 1600 },
    ]);
    expect(sizeHint('A3')).toBe('29,7 × 42 cm');
    expect(defaultPrintSize([
      { label: 'A5', priceCents: 800 },
      { label: 'A4', priceCents: 1200 },
      { label: 'A3', priceCents: 1600 },
    ]).label).toBe('A4');
  });

  it('defaults to A4 and shows the starting price', () => {
    const sizes = parsePrintSizes([
      { label: 'A5', priceCents: 800 },
      { label: 'A4', priceCents: 1200 },
    ]);
    expect(defaultPrintSize(sizes).label).toBe('A4');
    expect(
      minPrintPrice({
        priceCents: 800,
        sizes,
      } as Product),
    ).toBe(800);
  });

  it('uses a tall frame for portrait prints', () => {
    expect(paperAspect('portrait')).toBe('aspect-[1640/2360]');
    expect(paperAspect('landscape')).toBe('aspect-[2360/1640]');
    expect(paperAspect('square')).toBe('aspect-square');
    expect(shopFrameAspect('sticker', 'square')).toBe('aspect-square');
    expect(shopFrameFit('sticker', 'square')).toBe('contain');
  });

  it('names Howl skies in the cart line', () => {
    expect(parsePrintEditions([
      { label: 'Noche oscura', url: '/shop/prints/howl-noche-clara.png' },
      { label: 'Estrellas fugaces', url: '/shop/prints/howl-estrellas.png' },
    ])).toHaveLength(2);
    expect(printLineTitle('Howl', 'Noche oscura', 'A4')).toBe('Howl · Noche oscura · A4');
  });
});

describe('home mosaic', () => {
  it('reads landscape, portrait and square from the frame', () => {
    expect(pieceShape({ category: 'print', frame: 'landscape' })).toBe('landscape');
    expect(pieceShape({ category: 'original', frame: 'portrait' })).toBe('portrait');
    expect(pieceShape({ category: 'sticker', frame: 'square' })).toBe('square');
    expect(pieceShape({ category: 'sticker', frame: 'portrait' })).toBe('square');
  });

  it('places landscapes half-width and the rest in thirds', () => {
    expect(mosaicSpan('landscape')).toBe('col-span-2 md:col-span-3');
    expect(mosaicSpan('portrait')).toBe('col-span-1 md:col-span-2');
    expect(mosaicSpan('square')).toBe('col-span-1 md:col-span-2');
    expect(shopFrameAspect('print', 'landscape')).toBe('aspect-[2360/1640]');
    expect(shopFrameAspect('original', 'portrait')).toBe('aspect-[1640/2360]');
    expect(shopFrameAspect('sticker', 'square')).toBe('aspect-square');

    const columns =
      2 * 3 + // landscapes
      3 * 2 + // portraits
      3 * 2; // stickers
    expect(columns).toBe(6 * 3);
  });

  it('picks originals, prints and stickers in a stable mosaic order', () => {
    const catalog = [
      stubProduct({ slug: 'shaymin', category: 'sticker', frame: 'square' }),
      stubProduct({ slug: 'jirachi', category: 'sticker', frame: 'square' }),
      stubProduct({ slug: 'manaphy', category: 'sticker', frame: 'square' }),
      stubProduct({ slug: 'celebi', category: 'sticker', frame: 'square' }),
      stubProduct({ slug: 'chica-sol', category: 'original', frame: 'portrait' }),
      stubProduct({ slug: 'howl', category: 'print', frame: 'landscape' }),
      stubProduct({ slug: 'diamante-blanco', category: 'print', frame: 'portrait' }),
      stubProduct({ slug: 'opalo', category: 'print', frame: 'portrait' }),
      stubProduct({ slug: 'lilimon', category: 'print', frame: 'landscape' }),
      stubProduct({ slug: 'cerezas-gemelas', category: 'print', frame: 'portrait' }),
    ];

    const pieces = selectHomePieces(catalog);
    expect(pieces.map((item) => item.slug)).toEqual([
      'howl',
      'lilimon',
      'opalo',
      'chica-sol',
      'diamante-blanco',
      'celebi',
      'manaphy',
      'jirachi',
    ]);
    expect(pieces.map((item) => item.category).sort()).toEqual([
      'original',
      'print',
      'print',
      'print',
      'print',
      'sticker',
      'sticker',
      'sticker',
    ]);
    expect(new Set(pieces.map((item) => pieceShape(item)))).toEqual(
      new Set(['landscape', 'portrait', 'square']),
    );
  });

  it('packs shop pieces by shape so mixed prints do not leave holes', () => {
    const prints = [
      stubProduct({ slug: 'howl', category: 'print', frame: 'landscape' }),
      stubProduct({ slug: 'diamante-blanco', category: 'print', frame: 'portrait' }),
      stubProduct({ slug: 'opalo', category: 'print', frame: 'portrait' }),
      stubProduct({ slug: 'lilimon', category: 'print', frame: 'landscape' }),
    ];
    expect(packShopPieces(prints).map((item) => item.slug)).toEqual([
      'howl',
      'lilimon',
      'diamante-blanco',
      'opalo',
    ]);
    const packed = packShopPieces(prints);
    expect(shopMosaicSpan(packed[0], packed)).toBe('md:col-span-3');
    expect(shopMosaicSpan(packed[2], packed)).toBe('md:col-span-3');

    const threePortraits = packShopPieces([
      stubProduct({ slug: 'a', category: 'print', frame: 'portrait' }),
      stubProduct({ slug: 'b', category: 'print', frame: 'portrait' }),
      stubProduct({ slug: 'c', category: 'original', frame: 'portrait' }),
    ]);
    expect(shopMosaicSpan(threePortraits[0], threePortraits)).toBe('md:col-span-2');
  });

  it('keeps the same mosaic spans as Todas for every category', () => {
    const howl = stubProduct({ slug: 'howl', category: 'print', frame: 'landscape' });
    const opalo = stubProduct({ slug: 'opalo', category: 'print', frame: 'portrait' });
    const chica = stubProduct({ slug: 'chica-sol', category: 'original', frame: 'portrait' });
    const celebi = stubProduct({ slug: 'celebi', category: 'sticker', frame: 'square' });
    expect(mosaicSpan(pieceShape(howl))).toBe('col-span-2 md:col-span-3');
    expect(mosaicSpan(pieceShape(opalo))).toBe('col-span-1 md:col-span-2');
    expect(mosaicSpan(pieceShape(chica))).toBe('col-span-1 md:col-span-2');
    expect(mosaicSpan(pieceShape(celebi))).toBe('col-span-1 md:col-span-2');

    const catalog = packShopPieces([howl, opalo, chica, celebi, stubProduct({ slug: 'lilimon', category: 'print', frame: 'landscape' })]);
    expect(catalog.map((item) => item.slug)).toEqual(['howl', 'lilimon', 'opalo', 'chica-sol', 'celebi']);
    expect(catalog.filter((item) => item.category === 'print').map((item) => item.slug)).toEqual([
      'howl',
      'lilimon',
      'opalo',
    ]);
  });

  it('lets an odd leftover portrait span the phone row without changing desktop thirds', () => {
    const howl = stubProduct({ slug: 'howl', category: 'print', frame: 'landscape' });
    const lilimon = stubProduct({ slug: 'lilimon', category: 'print', frame: 'landscape' });
    const opalo = stubProduct({ slug: 'opalo', category: 'print', frame: 'portrait' });
    const chica = stubProduct({ slug: 'chica-sol', category: 'original', frame: 'portrait' });
    const diamante = stubProduct({ slug: 'diamante-blanco', category: 'print', frame: 'portrait' });
    const celebi = stubProduct({ slug: 'celebi', category: 'sticker', frame: 'square' });
    const packed = [howl, lilimon, opalo, chica, diamante, celebi];
    expect(mosaicSpanInList(howl, packed)).toBe('col-span-2 md:col-span-3');
    expect(mosaicSpanInList(opalo, packed)).toBe('col-span-1 md:col-span-2');
    expect(mosaicSpanInList(chica, packed)).toBe('col-span-1 md:col-span-2');
    expect(mosaicSpanInList(diamante, packed)).toBe('col-span-2 md:col-span-2');
    expect(mosaicSpanInList(celebi, packed)).toBe('col-span-2 md:col-span-2');
  });

  it('keeps all three sticker photos for the shop carousel', () => {
    const celebi = stubProduct({
      slug: 'celebi',
      category: 'sticker',
      frame: 'square',
      images: [
        { id: '1', url: '/shop/stickers/celebi-vineta.jpg', alt: 'viñeta', sortOrder: 0 },
        { id: '2', url: '/shop/stickers/celebi-troquel.jpg', alt: 'troquel', sortOrder: 1 },
        { id: '3', url: '/shop/stickers/celebi-campo.jpg', alt: 'ambiente', sortOrder: 2 },
      ],
    });
    expect(shopDisplayImages(celebi).map((shot) => shot.url)).toEqual([
      '/shop/stickers/celebi-vineta.jpg',
      '/shop/stickers/celebi-troquel.jpg',
      '/shop/stickers/celebi-campo.jpg',
    ]);
  });

  it('still cycles Howl through its two skies', () => {
    const howl = stubProduct({
      slug: 'howl',
      category: 'print',
      frame: 'landscape',
      editions: [
        { label: 'Noche oscura', url: '/shop/prints/howl-noche-clara.png' },
        { label: 'Estrellas fugaces', url: '/shop/prints/howl-estrellas.png' },
      ],
      images: [
        { id: '1', url: '/shop/prints/howl-noche-clara.png', alt: 'noche', sortOrder: 0 },
        { id: '2', url: '/shop/prints/howl-estrellas.png', alt: 'estrellas', sortOrder: 1 },
      ],
    });
    expect(shopDisplayImages(howl).map((shot) => shot.id)).toEqual(['Noche oscura', 'Estrellas fugaces']);
  });
});
