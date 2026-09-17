import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Product } from '../../types/shop';
import { artworkImgProps, ProtectedArt } from './ProtectedArt';
import { formatMoney } from '../../utils/money';
import { minPrintPrice, pieceShape, productSizes, shopDisplayImages, shopFrameFit } from '../../utils/print';
import { useSwipeShots } from './useSwipeShots';

export function LookbookSlide({
  product,
  look,
}: {
  product: Product;
  look: number;
}) {
  const images = shopDisplayImages(product);
  const swipe = useSwipeShots(images.length);
  const current = images[swipe.shot] ?? images[0];
  const contain = shopFrameFit(product.category, product.frame) === 'contain';
  const sizes = productSizes(product);

  return (
    <Link
      to={`/tienda/${product.slug}`}
      className="group shrink-0"
      onClick={(event) => {
        if (!swipe.consumeSwipe()) return;
        event.preventDefault();
      }}
    >
      <div className="frame flex w-fit flex-col overflow-hidden">
        <div className="bg-pink p-2 sm:p-4">
          <motion.div className={`lookbook-art is-${pieceShape(product)}`} {...swipe.stageProps}>
            <AnimatePresence mode="popLayout" initial={false}>
              {current && (
                <ProtectedArt
                  key={current.url + swipe.shot}
                  className="absolute inset-0"
                  initial={{ opacity: 0.4, scale: 1.06 }}
                  animate={{ opacity: 1, scale: swipe.hover ? 1.08 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <img
                    src={current.url}
                    alt={current.alt || product.title}
                    className={`absolute inset-0 h-full w-full ${contain ? 'object-contain' : 'object-cover'}`}
                    loading="lazy"
                    decoding="async"
                    {...artworkImgProps}
                  />
                </ProtectedArt>
              )}
            </AnimatePresence>
            {swipe.carousel && (
              <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-1.5">
                {images.map((image, i) => (
                  <span
                    key={image.id}
                    aria-hidden
                    className={`h-1.5 rounded-full border border-cobalt ${i === swipe.shot ? 'w-5 bg-yellow' : 'w-1.5 bg-cream'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
        <div className="flex min-h-[3.8rem] w-0 min-w-full shrink-0 flex-col justify-center gap-0.5 px-2.5 py-2 sm:h-[5.25rem] sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-0">
          <div className="min-w-0">
            <p className="font-head truncate text-sm font-extrabold sm:text-lg">{product.title}</p>
            <p className="font-serif truncate italic text-[10px] sm:text-base">
              {look < 10 ? `0${look}` : look} / look
            </p>
          </div>
          <p className="font-head shrink-0 whitespace-nowrap text-xs font-extrabold sm:text-base">
            {sizes.length > 1 ? `desde ${formatMoney(minPrintPrice(product))}` : formatMoney(product.priceCents)}
          </p>
        </div>
      </div>
    </Link>
  );
}
