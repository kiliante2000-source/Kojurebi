import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '../services/api';
import type { Product } from '../types/shop';
import { CATEGORIES } from '../types/shop';
import { ProductCard } from '../components/shop/ProductCard';
import { Reveal } from '../components/brand/Decor';
import { MOSAIC_GRID, mosaicSpanInList, packShopPieces } from '../utils/print';
import { scrollToPageTop } from '../utils/scroll';

export function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [pastFilters, setPastFilters] = useState(false);
  const [dockOpen, setDockOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<{ products: Product[] }>('/api/catalog/products')
      .then((data) => setProducts(data.products))
      .catch((e: Error) => setError(e.message));
  }, []);

  useEffect(() => {
    const el = filterRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPastFilters(!entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const packedAll = useMemo(() => packShopPieces(products), [products]);
  const packed = useMemo(
    () => (category === 'all' ? packedAll : packedAll.filter((product) => product.category === category)),
    [packedAll, category],
  );
  const filters = [{ id: 'all', label: 'Todas' }, ...CATEGORIES];
  const active = filters.find((f) => f.id === category) ?? filters[0];

  const pick = (id: string) => {
    setCategory(id);
    setDockOpen(false);
    scrollToPageTop();
  };

  return (
    <div className="relative px-4 py-6 md:px-8 md:py-14">
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="font-serif text-base italic sm:text-xl">archivo abierto · sin registro</p>
          <h1 className="font-head whitespace-nowrap text-[clamp(2rem,10vw,2.35rem)] font-extrabold leading-[0.86] sm:text-6xl">Catálogo</h1>
        </Reveal>
        <div ref={filterRef} className="mt-6">
          <div className="flex flex-wrap gap-2 sm:-mx-4 sm:flex-nowrap sm:overflow-x-auto sm:px-4 sm:pb-1 hide-scrollbar">
            {filters.map((cat) => (
              <button
                key={cat.id}
                className={`border-3 border-cobalt px-3 py-2 font-head text-xs font-extrabold uppercase tracking-wide sm:shrink-0 sm:px-4 sm:py-2 sm:text-sm ${
                  category === cat.id ? 'bg-yellow' : 'bg-cream'
                }`}
                onClick={() => pick(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="mt-6 font-head text-cherry">{error}</p>}
        {packed.length === 0 && !error ? (
          <p className="font-serif mt-16 max-w-md text-xl italic text-pink-deep">
            {category === 'pack'
              ? 'Todavía no hay packs. El estudio los está componiendo.'
              : 'Aquí no hay nada todavía.'}
          </p>
        ) : (
          <div className={`mt-5 sm:mt-12 ${MOSAIC_GRID}`}>
            {packed.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                stagger={false}
                variant="mosaic"
                spanClass={mosaicSpanInList(product, packed)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {pastFilters && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="no-print fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2 md:right-8"
          >
            <AnimatePresence>
              {dockOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="flex flex-col items-end gap-2"
                >
                  {filters
                    .filter((cat) => cat.id !== category)
                    .map((cat) => (
                      <button
                        key={cat.id}
                        className="border-3 border-cobalt bg-cream px-3 py-1.5 font-head text-xs font-extrabold uppercase tracking-wide text-cobalt shadow-[4px_4px_0_#1D3A6E]"
                        onClick={() => pick(cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              aria-expanded={dockOpen}
              aria-label={`Filtro actual: ${active.label}. Abrir categorías`}
              className="border-3 border-cobalt bg-yellow px-4 py-2 font-head text-sm font-extrabold uppercase tracking-wide text-cobalt shadow-[5px_5px_0_#1D3A6E]"
              onClick={() => setDockOpen((open) => !open)}
            >
              {active.label} {dockOpen ? '×' : '↓'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
