import { useEffect, useId, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { artworkImgProps, ProtectedArt } from './ProtectedArt';
import { cn } from '../../utils/cn';

export type ArtworkView = {
  url: string;
  alt?: string;
};

export function isPhoneArtworkViewport() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(max-width: 1023px)').matches;
}

export function usePhoneArtworkViewport() {
  const [phone, setPhone] = useState(isPhoneArtworkViewport);
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(max-width: 1023px)');
    const sync = () => setPhone(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return phone;
}

export function ExpandArtButton({
  onClick,
  label = 'ver grande',
  className,
}: {
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-3 border-cobalt bg-yellow px-1.5 py-0.5 font-head text-[9px] font-extrabold uppercase tracking-wide text-cobalt shadow-[3px_3px_0_#1D3A6E] lg:hidden sm:px-2 sm:py-1 sm:text-[11px]',
        className,
      )}
    >
      {label}
    </button>
  );
}

export function ArtworkLightbox({
  open,
  images,
  index = 0,
  title,
  onClose,
  onIndexChange,
}: {
  open: boolean;
  images: ArtworkView[];
  index?: number;
  title?: string;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
}) {
  const labelId = useId();
  const count = images.length;
  const current = images[Math.min(Math.max(index, 0), Math.max(count - 1, 0))];
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setZoomed(false);
    if (!isPhoneArtworkViewport()) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && count > 1) onIndexChange?.((index + 1) % count);
      if (event.key === 'ArrowLeft' && count > 1) onIndexChange?.((index - 1 + count) % count);
    };
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1024px)') : null;
    const onDesktop = () => {
      if (mq?.matches) onClose();
    };
    document.addEventListener('keydown', onKey);
    mq?.addEventListener('change', onDesktop);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
      mq?.removeEventListener('change', onDesktop);
    };
  }, [open, onClose, count, index, onIndexChange]);

  useEffect(() => {
    setZoomed(false);
  }, [index, current?.url]);

  if (!open || !current || typeof document === 'undefined') return null;

  const go = (dir: number) => {
    if (count < 2) return;
    onIndexChange?.((index + dir + count) % count);
  };

  return createPortal(
    <div
      className="artwork-lightbox lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelId}
    >
      <div className="flex items-center justify-between gap-3 px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p id={labelId} className="min-w-0 truncate font-head text-sm font-extrabold uppercase tracking-wide">
          {title ?? 'Dibujo'}
        </p>
        <button
          type="button"
          className="shrink-0 border-3 border-cobalt bg-cream px-3 py-1.5 font-head text-xs font-extrabold uppercase tracking-wide"
          onClick={onClose}
        >
          cerrar
        </button>
      </div>

      <div
        className={cn('artwork-lightbox-stage', zoomed && 'is-zoomed')}
        onDoubleClick={() => setZoomed((value) => !value)}
      >
        <ProtectedArt className="artwork-lightbox-art">
          <img
            src={current.url}
            alt={current.alt || title || ''}
            className="object-contain"
            {...artworkImgProps}
          />
        </ProtectedArt>
      </div>

      <div className="flex items-center justify-between gap-3 px-3 pb-[max(0.85rem,env(safe-area-inset-bottom))]">
        {count > 1 ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Imagen anterior"
              className="grid h-11 w-11 place-items-center border-3 border-cobalt bg-cream font-head text-xl"
              onClick={() => go(-1)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              className="grid h-11 w-11 place-items-center border-3 border-cobalt bg-cream font-head text-xl"
              onClick={() => go(1)}
            >
              →
            </button>
            <span className="font-head text-xs font-extrabold">
              {index + 1}/{count}
            </span>
          </div>
        ) : (
          <p className="font-serif text-sm italic">Toca dos veces para acercar.</p>
        )}
        <button
          type="button"
          className={`border-3 border-cobalt px-3 py-1.5 font-head text-xs font-extrabold uppercase tracking-wide ${
            zoomed ? 'bg-cream' : 'bg-yellow'
          }`}
          onClick={() => setZoomed((value) => !value)}
        >
          {zoomed ? 'encajar' : 'acercar'}
        </button>
      </div>
    </div>,
    document.body,
  );
}
