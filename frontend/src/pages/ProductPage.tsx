import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../services/api';
import type { Product } from '../types/shop';
import { isPaperEdition } from '../types/shop';
import { categoryLabel, formatMoney } from '../utils/money';
import { defaultPrintEdition, defaultPrintSize, editionHint, productEditions, productSizes, shopDisplayImages, shopFrameAspect, shopFrameFit, sizeHint } from '../utils/print';
import { useCartStore } from '../stores/cartStore';
import { ImageCarousel } from '../components/shop/ImageCarousel';
import { ArtworkLightbox, usePhoneArtworkViewport } from '../components/shop/ArtworkLightbox';
import { ProtectedImg } from '../components/shop/ProtectedArt';
import { Magnetic } from '../components/brand/Decor';

export function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeLabel, setSizeLabel] = useState<string | null>(null);
  const [editionLabel, setEditionLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const add = useCartStore((s) => s.add);
  const phone = usePhoneArtworkViewport();

  useEffect(() => {
    if (!slug) return;
    api
      .get<{ product: Product }>(`/api/catalog/products/${slug}`)
      .then((data) => {
        setProduct(data.product);
        setQty(1);
        setAdded(false);
        const sizes = productSizes(data.product);
        const editions = productEditions(data.product);
        setSizeLabel(sizes.length ? defaultPrintSize(sizes).label : null);
        setEditionLabel(editions.length ? defaultPrintEdition(editions).label : null);
      })
      .catch((e: Error) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-head text-4xl font-extrabold">Esta pieza no está</h1>
        <Link to="/tienda" className="btn-sticker mt-6 px-5 py-2">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (!product) {
    return <div className="px-4 py-20 text-center font-serif italic">Cargando la edición…</div>;
  }

  const sizes = productSizes(product);
  const editions = productEditions(product);
  const selected = sizes.find((size) => size.label === sizeLabel) ?? defaultPrintSize(sizes);
  const selectedEdition =
    editions.find((edition) => edition.label === editionLabel) ?? defaultPrintEdition(editions);
  const priceCents = selected?.priceCents ?? product.priceCents;
  const paper = isPaperEdition(product.category);
  const editionShots = editions.map((edition) => ({
    id: edition.label,
    url: edition.url,
    alt: `${product.title} · ${edition.label}`,
  }));
  const editionIndex = Math.max(
    0,
    editions.findIndex((edition) => edition.label === selectedEdition?.label),
  );
  const gallery = editions.length
    ? phone
      ? editionShots
      : selectedEdition
        ? [{ url: selectedEdition.url, alt: selectedEdition.label }]
        : editionShots
    : shopDisplayImages(product);

  const pickEdition = (label: string) => {
    setEditionLabel(label);
    setAdded(false);
    const next = editions.findIndex((edition) => edition.label === label);
    if (next >= 0) setViewerIndex(next);
  };

  const addToBag = () => {
    add(product, qty, selected, selectedEdition);
    setAdded(true);
  };

  return (
    <>
    <div
      className={`mx-auto grid max-w-[1400px] items-start gap-8 px-4 py-6 pb-44 max-sm:gap-4 max-sm:py-4 lg:gap-12 lg:py-12 lg:pb-12 md:px-8 ${
        paper ? 'lg:grid-cols-[1.25fr_0.75fr]' : 'lg:grid-cols-2'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="frame h-fit w-full overflow-hidden"
      >
        <ImageCarousel
          key={product.id}
          images={gallery}
          showThumbs={gallery.length > 1 && !phone}
          showArrows={!phone}
          aspect={shopFrameAspect(product.category, product.frame)}
          fit={shopFrameFit(product.category, product.frame)}
          capHeightOnMobile
          activeIndex={editions.length && phone ? editionIndex : undefined}
          onIndexChange={(next) => {
            setViewerIndex(next);
            const edition = editions[next];
            if (edition) {
              setEditionLabel(edition.label);
              setAdded(false);
            }
          }}
          onExpand={(next) => {
            setViewerIndex(next);
            setViewerOpen(true);
          }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col"
      >
        <p className="font-serif text-base italic text-pink-deep sm:text-xl">{categoryLabel(product.category)}</p>
        <h1 className="font-head text-[clamp(1.7rem,9vw,2rem)] font-extrabold leading-[0.9] sm:text-6xl">{product.title}</h1>
        <p className="mt-3 font-head text-xs font-extrabold uppercase tracking-[0.18em] opacity-70 sm:mt-4 sm:text-sm">
          {selected?.label ?? product.format}
        </p>
        <p className="font-head mt-3 text-[1.85rem] font-extrabold sm:mt-5 sm:text-5xl">{formatMoney(priceCents)}</p>
        {editions.length > 1 && (
          <div className="mt-5 order-3 max-sm:mt-3 max-lg:mb-6 lg:order-2">
            <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] opacity-70">Versión</p>
            <p className="font-serif mt-1 text-base italic max-sm:sr-only">Mismo dibujo, dos cielos. Elige el que más te guste.</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">
              {editions.map((edition) => {
                const active = edition.label === selectedEdition?.label;
                const hint = editionHint(edition.label);
                return (
                  <button
                    key={edition.label}
                    type="button"
                    onClick={() => pickEdition(edition.label)}
                    className={`relative overflow-hidden border-3 border-cobalt text-left ${active ? 'bg-yellow' : 'bg-cream'}`}
                  >
                    <ProtectedImg src={edition.url} alt="" className="aspect-[3/2] w-full object-cover max-lg:aspect-[2/1]" />
                    <span
                      className={`block px-2 py-2 max-lg:absolute max-lg:inset-x-0 max-lg:bottom-0 max-lg:px-1.5 max-lg:py-1 sm:px-3 ${
                        active ? 'max-lg:bg-yellow' : 'max-lg:bg-cream/95'
                      }`}
                    >
                      <span className="block font-head text-xs font-extrabold uppercase tracking-wide sm:text-sm">
                        {edition.label}
                      </span>
                      {hint && (
                        <span className="block font-serif text-sm italic max-sm:text-[10px] max-sm:leading-tight">{hint}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {sizes.length > 1 && (
          <div className="mt-5 order-2 max-sm:mt-3 max-lg:scroll-mt-24 lg:order-3">
            <p className="font-head text-xs font-extrabold uppercase tracking-[0.16em] opacity-70">Tamaño</p>
            <div className="mt-2 flex flex-wrap gap-2 max-sm:flex-nowrap max-sm:gap-1.5">
              {sizes.map((size) => {
                const active = size.label === selected?.label;
                const hint = sizeHint(size.label);
                return (
                  <button
                    key={size.label}
                    type="button"
                    onClick={() => {
                      setSizeLabel(size.label);
                      setAdded(false);
                    }}
                    className={`border-3 border-cobalt px-4 py-2 text-left font-head text-sm font-extrabold uppercase tracking-wide max-sm:min-w-0 max-sm:flex-1 max-sm:px-2 max-sm:py-1.5 ${
                      active ? 'bg-yellow' : 'bg-cream'
                    }`}
                  >
                    <span className="block">{size.label}</span>
                    <span className="block font-serif text-sm font-normal normal-case tracking-normal italic max-sm:whitespace-normal max-sm:text-[10px] max-sm:leading-tight">
                      {hint ? `${hint} · ` : ''}
                      {formatMoney(size.priceCents)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <p className="order-4 mt-4 max-w-lg text-sm leading-relaxed sm:mt-6 sm:text-lg">{product.description}</p>
        <p className="font-serif order-4 mt-3 text-base italic sm:text-xl">
          {product.stock > 0 ? `${product.stock} disponibles` : 'edición agotada'}
        </p>
        <div className="mt-8 hidden flex-wrap items-center gap-3 lg:order-4 lg:flex">
          <div className="flex items-center border-3 border-cobalt bg-cream">
            <button className="tap px-4 py-2 font-head text-2xl" onClick={() => setQty((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span className="font-head min-w-8 text-center">{qty}</span>
            <button
              className="tap px-4 py-2 font-head text-2xl"
              onClick={() => setQty((n) => Math.min(product.stock, n + 1))}
            >
              +
            </button>
          </div>
          <Magnetic>
            <button
              disabled={product.stock <= 0}
              className="btn-sticker px-6 py-3 text-lg disabled:opacity-50"
              onClick={addToBag}
            >
              Añadir a la bolsa
            </button>
          </Magnetic>
        </div>
        <AnimatePresence>
          {added && (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 hidden font-head lg:block"
            >
              Dentro.{' '}
              <Link to="/carrito" className="underline">
                Ver bolsa
              </Link>{' '}
              o{' '}
              <Link to="/checkout" className="underline">
                pagar ahora
              </Link>
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t-3 border-cobalt bg-yellow px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3">
          <div className="flex items-center border-3 border-cobalt bg-cream">
            <button className="tap px-3 font-head text-2xl" onClick={() => setQty((n) => Math.max(1, n - 1))}>
              −
            </button>
            <span className="font-head min-w-7 text-center">{qty}</span>
            <button
              className="tap px-3 font-head text-2xl"
              onClick={() => setQty((n) => Math.min(product.stock, n + 1))}
            >
              +
            </button>
          </div>
          <button
            disabled={product.stock <= 0}
            className="btn-sticker min-h-12 flex-1 px-4 py-2 text-base disabled:opacity-50"
            onClick={addToBag}
          >
            {added ? 'Dentro ★' : `Añadir · ${formatMoney(priceCents)}`}
          </button>
        </div>
        {added && (
          <p className="mx-auto mt-2 max-w-[1400px] font-head text-sm">
            <Link to="/carrito" className="underline">
              Ver bolsa
            </Link>
            {' · '}
            <Link to="/checkout" className="underline">
              pagar ahora
            </Link>
          </p>
        )}
      </div>
    </div>
    <ArtworkLightbox
      open={viewerOpen}
      images={gallery}
      index={viewerIndex}
      title={product.title}
      onClose={() => setViewerOpen(false)}
      onIndexChange={(next) => {
        setViewerIndex(next);
        const edition = editions[next];
        if (edition) {
          setEditionLabel(edition.label);
          setAdded(false);
        }
      }}
    />
    </>
  );
}
