import { Link } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { Product } from '../../types/shop';
import { artworkImgProps, ProtectedArt } from './ProtectedArt';
import { cn } from '../../utils/cn';
import { categoryLabel, formatMoney } from '../../utils/money';
import {
  minPrintPrice,
  mosaicSpan,
  pieceShape,
  productEditions,
  productSizes,
  shopFrameAspect,
  shopFrameFit,
} from '../../utils/print';

export function ProductCard({
  product,
  index = 0,
  stagger = true,
  variant = 'shop',
  spanClass,
}: {
  product: Product;
  index?: number;
  stagger?: boolean;
  variant?: 'shop' | 'mosaic';
  spanClass?: string;
}) {
  const images = product.images;
  const [shot, setShot] = useState(0);
  const [hover, setHover] = useState(false);
  const current = images[shot] ?? images[0];
  const contain = shopFrameFit(product.category, product.frame) === 'contain';
  const sizes = productSizes(product);
  const editions = productEditions(product);
  const price = minPrintPrice(product);
  const mosaic = variant === 'mosaic';
  const priceLabel = sizes.length > 1 ? `desde ${formatMoney(price)}` : formatMoney(price);

  useEffect(() => {
    if (!hover || images.length < 2) return;
    const timer = window.setInterval(() => {
      setShot((i) => (i + 1) % images.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [hover, images.length]);

  return (
    <Link
      to={`/tienda/${product.slug}`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        setShot(0);
      }}
      className={cn(
        'group block min-w-0',
        mosaic && (spanClass ?? mosaicSpan(pieceShape(product))),
        !mosaic && stagger && index % 2 === 1 && 'md:mt-7',
      )}
    >
      <div className="frame overflow-hidden transition duration-500 group-hover:-translate-y-2 group-hover:shadow-[14px_14px_0_#1D3A6E]">
        <div className={cn('relative overflow-hidden bg-pink', contain ? 'p-2 sm:p-4' : shopFrameAspect(product.category, product.frame))}>
          <div className={cn('relative', contain ? shopFrameAspect(product.category, product.frame) : 'absolute inset-0')}>
            <AnimatePresence mode="popLayout" initial={false}>
              {current ? (
                <ProtectedArt
                  key={current.url + shot}
                  className="absolute inset-0"
                  initial={{ opacity: 0.4, scale: 1.06 }}
                  animate={{ opacity: 1, scale: hover ? 1.08 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <img
                    src={current.url}
                    alt={current.alt || product.title}
                    className={cn(
                      'absolute inset-0 h-full w-full',
                      contain ? 'object-contain' : 'object-cover',
                    )}
                    loading={mosaic ? 'eager' : 'lazy'}
                    decoding="async"
                    {...artworkImgProps}
                  />
                </ProtectedArt>
              ) : (
                <div className="grid h-full place-items-center font-serif text-xl italic">sin foto</div>
              )}
            </AnimatePresence>
          </div>
          <span className="absolute left-1.5 top-1.5 border-3 border-cobalt bg-yellow px-1.5 py-0.5 font-head text-[9px] font-extrabold uppercase tracking-wide sm:left-3 sm:top-3 sm:px-2 sm:py-1 sm:text-[11px]">
            {categoryLabel(product.category)}
          </span>
          {(editions.length > 1 || images.length > 1) && (
            <span className="absolute right-1.5 top-1.5 border-3 border-cobalt bg-cream px-1.5 py-0.5 font-head text-[9px] font-extrabold sm:right-3 sm:top-3 sm:px-2 sm:py-1 sm:text-[11px]">
              {editions.length > 1 ? `${editions.length} versiones` : `${images.length} fotos`}
            </span>
          )}
          {product.stock <= 0 && (
            <span className="absolute right-3 bottom-3 bg-cobalt px-2 py-1 font-head text-[11px] text-yellow">
              agotado
            </span>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
              {images.map((image, i) => (
                <button
                  key={image.id}
                  type="button"
                  aria-label={`Foto ${i + 1}`}
                  className={`h-1.5 rounded-full border border-cobalt ${i === shot ? 'w-5 bg-yellow' : 'w-1.5 bg-cream'}`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShot(i);
                    setHover(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="bg-cream px-2 py-2 sm:px-4 sm:py-4">
          <h3 className="font-head truncate text-sm font-extrabold leading-none sm:text-xl">{product.title}</h3>
          <div className="mt-1 flex items-baseline justify-between gap-1.5">
            <p className="font-serif min-w-0 truncate text-xs italic leading-none text-pink-deep sm:text-lg">{product.format}</p>
            <p className="font-head shrink-0 whitespace-nowrap text-xs font-extrabold leading-none sm:text-lg">{priceLabel}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
