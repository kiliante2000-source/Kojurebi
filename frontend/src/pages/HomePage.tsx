import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { DraggableSticker, Heart, Magnetic, Marquee, Reveal, Star, TiltFrame, Wordmark } from '../components/brand/Decor';
import { ProductCard } from '../components/shop/ProductCard';
import { LookbookSlide } from '../components/shop/LookbookSlide';
import { ProtectedImg } from '../components/shop/ProtectedArt';
import { api } from '../services/api';
import type { Product } from '../types/shop';
import { MOSAIC_GRID, isStudioPrint, mosaicSpanInList, selectHomePieces } from '../utils/print';

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [lookbookSource, setLookbookSource] = useState<Product[]>([]);
  const lookbookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get<{ products: Product[] }>('/api/catalog/products')
      .then((data) => {
        setFeatured(selectHomePieces(data.products));
        const moving = data.products.filter((product) => isStudioPrint(product) || product.category === 'sticker');
        setLookbookSource(moving.length ? moving : data.products.slice(0, 6));
      })
      .catch(() => {
        setFeatured([]);
        setLookbookSource([]);
      });
  }, []);

  useEffect(() => {
    const el = lookbookRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        el.classList.toggle('is-offscreen', !entry.isIntersecting);
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [lookbookSource.length]);

  const lookbook = lookbookSource.length ? [...lookbookSource, ...lookbookSource] : [];

  return (
    <div>
      <div className="home-screen">
        <section className="home-hero relative z-20 overflow-visible bg-pink px-4 pb-6 pt-4 md:px-8 md:pb-8 md:pt-6">
          <p
            aria-hidden
            className="pointer-events-none absolute -left-5 -top-1 font-head text-[34vw] font-extrabold leading-[0.78] text-cobalt/10 md:-left-8 md:-top-2 md:text-[16vw]"
          >
            KOJU
          </p>
          <DraggableSticker className="hidden md:block md:top-[12%] md:left-[5%]">
            <Star className="h-24 w-24" />
          </DraggableSticker>
          <DraggableSticker className="hidden md:block md:top-[20%] md:right-[8%]">
            <Heart className="h-8 w-8" />
          </DraggableSticker>
          <DraggableSticker className="hidden md:block md:top-[42%] md:left-[14%]">
            <Star className="h-7 w-7" delay={1.1} />
          </DraggableSticker>
          <DraggableSticker className="hidden md:block md:bottom-[18%] md:left-[6%]">
            <Heart className="h-[4.5rem] w-[4.5rem]" />
          </DraggableSticker>
          <DraggableSticker className="hidden md:block md:bottom-[26%] md:right-[6%]">
            <Star className="h-11 w-11" delay={0.6} />
          </DraggableSticker>
          <DraggableSticker className="hidden md:block md:bottom-[12%] md:right-[18%]">
            <span className="border-3 border-cobalt bg-yellow px-3 py-1 font-head text-xs font-extrabold uppercase">
              arrástrame
            </span>
          </DraggableSticker>

          <div className="relative z-10 mx-auto grid w-full max-w-[1400px] items-center gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:gap-8">
            <Reveal className="relative z-20 order-2 bg-pink lg:order-1 lg:bg-transparent">
              <p className="font-serif text-sm italic sm:text-xl">art things people ♡</p>
              <Wordmark className="mt-1.5 block whitespace-nowrap text-[clamp(2.6rem,12.8vw,3.45rem)] sm:text-8xl lg:text-[7rem]" />
              <p className="mt-3.5 max-w-xl font-head text-lg font-extrabold leading-[1.05] max-sm:whitespace-nowrap sm:mt-2.5 sm:text-3xl">
                Small art.{' '}
                <br className="max-sm:hidden" />
                Big vibes.
              </p>
              <p className="mt-3 max-w-xl text-sm leading-relaxed sm:text-xl">
                Prints, stickers y originales con grano de lápiz.
              </p>
              <p className="mt-0.5 max-w-xl text-sm leading-relaxed sm:text-xl">
                Entras, miras y te lo llevas sin cuenta.
              </p>
              <div className="mt-5 flex flex-row flex-wrap gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap">
                <Magnetic className="sm:w-auto">
                  <Link to="/tienda" className="btn-sticker px-4 py-2.5 text-sm sm:w-auto sm:px-7 sm:py-3 sm:text-lg">
                    Ver el catálogo
                  </Link>
                </Magnetic>
                <Magnetic className="sm:w-auto">
                  <Link to="/estudio" className="btn-sticker cream px-4 py-2.5 text-sm sm:w-auto sm:px-7 sm:py-3 sm:text-lg">
                    El estudio
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
            <div className="relative z-10 order-1 mx-auto w-full max-w-none lg:order-2 lg:z-30 lg:max-w-2xl">
              <DraggableSticker className="top-[5%] left-[3%] md:hidden">
                <Star className="h-14 w-14" />
              </DraggableSticker>
              <DraggableSticker className="top-[8%] left-[28%] md:hidden">
                <Heart className="h-7 w-7" />
              </DraggableSticker>
              <DraggableSticker className="top-[18%] right-[6%] md:hidden">
                <Star className="h-9 w-9" delay={0.6} />
              </DraggableSticker>
              <DraggableSticker className="top-[32%] left-[3%] md:hidden">
                <Heart className="h-12 w-12" />
              </DraggableSticker>
              <DraggableSticker className="top-[44%] left-[8%] md:hidden">
                <Star className="h-6 w-6" delay={1.1} />
              </DraggableSticker>
              <DraggableSticker className="top-[38%] right-[4%] md:hidden">
                <span className="border-3 border-cobalt bg-yellow px-2 py-1 font-head text-[10px] font-extrabold uppercase">
                  arrástrame
                </span>
              </DraggableSticker>
              <TiltFrame>
                <ProtectedImg
                  src="/brand/cherries.png"
                  alt="Mascotas cereza de Kojurebi"
                  className="frame wave-mask w-full object-cover"
                  fetchPriority="high"
                  decoding="async"
                />
              </TiltFrame>
              <div className="pointer-events-none absolute z-20 hidden -rotate-12 lg:block lg:-bottom-24 lg:-left-24 lg:w-60">
                <ProtectedImg
                  src="/brand/cards.png"
                  alt="Tarjeta de visita Kojurebi"
                  className="frame w-full object-cover"
                  decoding="async"
                />
              </div>
              <span className="absolute right-1 top-2 z-20 rotate-6 border-3 border-cobalt bg-cream px-2 py-1 font-head text-[10px] font-extrabold sm:-right-2 sm:top-8 sm:px-3 sm:text-xs">
                @kojurebi
              </span>
            </div>
          </div>
        </section>
        <div className="marquee-pair relative z-10 mt-auto">
          <Marquee items={['GOOD IDEAS SWEETER DAYS', 'SMALL ART BIG VIBES', 'ART THINGS PEOPLE ♡', 'KOJUREBI STUDIO']} />
          <Marquee reverse items={['PRINT', 'STICKER', 'ORIGINAL', 'RISÓGRAFO', 'COBALTO', 'BUBBLEGUM']} />
        </div>
      </div>

      <section className="border-b-3 border-cobalt bg-cream px-4 py-8 md:px-8 md:py-20">
        <div className="mx-auto max-w-[1400px]">
          <Reveal className="mb-5 md:mb-10">
            <h2 className="font-head text-[clamp(1.55rem,12vw,2.15rem)] font-extrabold leading-[0.86] sm:text-6xl sm:leading-[0.9]">
              <span className="sm:hidden">
                Dibujitos
                <span className="mt-1 block">que se llevan</span>
              </span>
              <span className="hidden sm:inline">Dibujitos que se llevan</span>
            </h2>
            <p className="font-serif mt-3 max-w-2xl text-base italic leading-snug sm:hidden">
              Originales, prints y stickers. Cada uno en su forma,
            </p>
            <p className="font-serif mt-0.5 max-w-2xl text-base italic leading-snug sm:hidden">
              todos en la misma pared.
            </p>
            <p className="font-serif mt-2 hidden max-w-2xl text-base italic sm:block sm:text-xl">
              Originales, prints y stickers. Cada uno en su forma, todos en la misma pared.
            </p>
          </Reveal>
          <div className={MOSAIC_GRID}>
            {featured.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                stagger={false}
                variant="mosaic"
                spanClass={mosaicSpanInList(product, featured)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream py-8 md:py-16">
        <Reveal className="mb-4 flex items-end justify-between gap-3 px-4 md:mb-8 md:px-8">
          <div className="min-w-0 flex-1 pr-2">
            <p className="font-serif text-base italic text-pink-deep sm:text-xl">lookbook</p>
            <h2 className="font-head text-[clamp(1.35rem,6vw,1.85rem)] font-extrabold leading-[0.92] sm:text-6xl">
              Ediciones en movimiento
            </h2>
          </div>
          <Link to="/tienda" className="btn-sticker shrink-0 px-3 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm">
            Shop
          </Link>
        </Reveal>
        <div ref={lookbookRef} className="lookbook-wrap">
          <div className="lookbook-track">
            {lookbook.map((product, index) => (
              <LookbookSlide
                key={`${product.id}-${index}`}
                product={product}
                look={(index % lookbookSource.length) + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="cv-auto grid md:grid-cols-2">
        <Reveal className="bg-cobalt px-5 py-8 text-cream md:px-12 md:py-20">
          <p className="font-serif text-base italic text-yellow sm:text-xl">01 — eliges</p>
          <h3 className="font-head mt-2 text-[1.85rem] font-extrabold sm:whitespace-nowrap sm:text-5xl">Catálogo abierto</h3>
          <p className="mt-3 max-w-md text-sm text-cream/80 sm:text-lg">
            Entras sin registro. Filtras prints, stickers u originales. Las fotos se deslizan.
          </p>
        </Reveal>
        <Reveal delay={0.08} className="bg-pink-hot px-5 py-8 text-cream md:px-12 md:py-20">
          <p className="font-serif text-base italic sm:text-xl">02 — nos escribes</p>
          <h3 className="font-head mt-2 text-[1.85rem] font-extrabold sm:whitespace-nowrap sm:text-5xl">Dirección y pago</h3>
          <p className="mt-3 max-w-md text-sm text-cream/90 sm:text-lg">
            Un comprobante para ti y otro para el estudio: qué imprimir y a qué buzón mandarlo.
          </p>
        </Reveal>
      </section>

      <section className="cv-auto relative overflow-hidden bg-yellow px-4 py-10 md:px-8 md:py-24">
        <p className="pointer-events-none absolute right-0 top-0 font-head text-[22vw] font-extrabold leading-[0.78] text-cobalt/10 sm:text-[18vw]">
          DAYS
        </p>
        <Reveal className="relative z-10 mx-auto max-w-4xl">
          <p className="font-serif text-lg italic sm:text-2xl">una triste · una feliz</p>
          <h2 className="font-head mt-2 text-[clamp(1.5rem,7vw,1.85rem)] font-extrabold leading-[0.9] sm:text-6xl">El estudio cabe en un sobre</h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed sm:text-lg">
            Pintamos cerezas, estrellas y olas magenta. Si te llevas un print, te llevas un recorte de esa energía a
            la pared. Envío gratis desde 40€.
          </p>
          <Link to="/tienda" className="btn-sticker mt-6 inline-flex px-6 py-2.5 text-base sm:mt-8 sm:w-auto sm:px-8 sm:py-3 sm:text-lg">
            Ver el catálogo
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
