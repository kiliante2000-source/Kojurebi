import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState } from 'react';
import { artworkImgProps, ProtectedArt, ProtectedImg } from './ProtectedArt';

export type CarouselImage = {
  id?: string;
  url: string;
  alt?: string;
};

export function ImageCarousel({
  images,
  className = '',
  aspect = 'aspect-[4/5]',
  fit = 'cover',
  showThumbs = false,
  showArrows = true,
  autoPlay = false,
  interval = 2800,
  capHeightOnMobile = false,
  onExpand,
  activeIndex,
  onIndexChange,
}: {
  images: CarouselImage[];
  className?: string;
  aspect?: string;
  fit?: 'cover' | 'contain';
  showThumbs?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  interval?: number;
  capHeightOnMobile?: boolean;
  onExpand?: (index: number) => void;
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(activeIndex ?? 0);
  const [direction, setDirection] = useState(0);
  const count = images.length;

  const goTo = useCallback(
    (next: number, dir?: number) => {
      if (count < 2) return;
      const wrapped = (next + count) % count;
      setDirection(dir ?? (wrapped > index ? 1 : -1));
      setIndex(wrapped);
      onIndexChange?.(wrapped);
    },
    [count, index, onIndexChange],
  );

  const go = useCallback(
    (dir: number) => {
      goTo(index + dir, dir);
    },
    [goTo, index],
  );

  const jump = (next: number) => {
    goTo(next, next > index ? 1 : -1);
  };

  useEffect(() => {
    if (typeof activeIndex !== 'number' || activeIndex === index) return;
    if (activeIndex < 0 || activeIndex >= count) return;
    setDirection(activeIndex > index ? 1 : -1);
    setIndex(activeIndex);
  }, [activeIndex, count, index]);

  useEffect(() => {
    if (!autoPlay || count < 2) return;
    const timer = window.setInterval(() => go(1), interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, count, go, interval, index]);

  if (count === 0) {
    return (
      <div className={`${aspect} grid place-items-center bg-pink font-serif text-2xl italic ${className}`}>
        sin imagen
      </div>
    );
  }

  const current = images[index] ?? images[0];
  const contain = fit === 'contain';

  return (
    <div className={`h-fit w-full ${className}`}>
      <div
        className={`relative overflow-hidden bg-pink ${contain ? 'p-4 sm:p-6' : aspect} ${
          capHeightOnMobile ? 'product-shot-stage' : ''
        }`}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.key === 'ArrowRight') go(1);
          if (event.key === 'ArrowLeft') go(-1);
        }}
      >
        <div
          className={
            contain
              ? `relative ${aspect} ${capHeightOnMobile ? 'product-shot-art' : ''}`
              : `absolute inset-0 ${capHeightOnMobile ? 'product-shot-art' : ''}`
          }
        >
          <motion.div
            className="absolute inset-0"
            style={{ touchAction: count > 1 ? 'pan-x pan-y' : 'pan-y' }}
            onPanEnd={(_, info) => {
              if (count < 2) return;
              if (info.offset.x < -60 || info.velocity.x < -350) go(1);
              if (info.offset.x > 60 || info.velocity.x > 350) go(-1);
            }}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <ProtectedArt
                key={`${current.url}-${index}`}
                className="absolute inset-0"
                custom={direction}
                initial={{ x: direction >= 0 ? 48 : -48, opacity: 0.2, scale: 1.04 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                exit={{ x: direction >= 0 ? -48 : 48, opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <img
                  src={current.url}
                  alt={current.alt || ''}
                  className={`absolute inset-0 h-full w-full ${contain ? 'object-contain' : 'object-cover'}`}
                  {...artworkImgProps}
                />
              </ProtectedArt>
            </AnimatePresence>
          </motion.div>
        </div>

        {count > 1 && showArrows && (
          <>
            <button
              type="button"
              aria-label="Imagen anterior"
              className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center border-3 border-cobalt bg-cream font-head text-xl lg:grid sm:left-3"
              onClick={() => go(-1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center border-3 border-cobalt bg-cream font-head text-xl lg:grid sm:right-3"
              onClick={() => go(1)}
            >
              →
            </button>
          </>
        )}

        {count > 1 && (
          <div className="absolute bottom-3 left-0 right-0 z-10 flex justify-center gap-2">
            {images.map((image, i) => (
              <button
                key={image.id ?? `${image.url}-${i}`}
                type="button"
                aria-label={`Ver imagen ${i + 1}`}
                className={`h-2.5 rounded-full border-2 border-cobalt transition-all ${
                  i === index ? 'w-7 bg-yellow' : 'w-2.5 bg-cream'
                }`}
                onClick={() => jump(i)}
              />
            ))}
          </div>
        )}

        {count > 1 && (
          <span className="absolute right-3 top-3 z-10 border-3 border-cobalt bg-yellow px-2 py-0.5 font-head text-xs font-extrabold">
            {index + 1}/{count}
          </span>
        )}

      </div>
      {onExpand && (
        <div className="border-t-3 border-cobalt bg-yellow lg:hidden">
          <button
            type="button"
            className="flex min-h-11 w-full items-center justify-center px-3 py-2 font-head text-xs font-extrabold uppercase tracking-wide"
            onClick={() => onExpand(index)}
          >
            ver grande
          </button>
        </div>
      )}

      {showThumbs && count > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {images.map((image, i) => (
            <button
              key={image.id ?? `${image.url}-thumb-${i}`}
              type="button"
              onClick={() => jump(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden border-3 ${
                i === index ? 'border-yellow' : 'border-cobalt'
              }`}
            >
              <ProtectedImg src={image.url} alt="" className="h-full w-full object-cover" wrapClassName="h-full w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
