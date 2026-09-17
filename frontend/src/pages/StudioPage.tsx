import { Link } from 'react-router-dom';
import { Reveal, TiltFrame, Wordmark } from '../components/brand/Decor';
import { ProtectedImg } from '../components/shop/ProtectedArt';

export function StudioPage() {
  return (
    <div className="px-4 py-6 md:px-8 md:py-14">
      <div className="mx-auto grid max-w-[1400px] items-center gap-8 overflow-visible lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <Reveal className="relative z-20">
          <p className="font-serif text-base italic sm:text-xl">small art : big vibes</p>
          <Wordmark className="mt-1.5 block whitespace-nowrap text-[clamp(2.6rem,12.8vw,3.45rem)] sm:text-8xl lg:text-[7rem]" />
          <p className="mt-4 max-w-xl text-sm leading-relaxed sm:mt-6 sm:text-lg">
            Kojurebi es un estudio de ilustración. Una cereza se enfurruña, la otra sonríe, y entre las dos construyen
            un lenguaje gráfico: línea cobalto, rosa chicle, amarillo neón y grano de lápiz.
          </p>
          <p className="mt-3 max-w-xl text-sm leading-relaxed sm:text-lg">
            Esta web es el mostrador. Entras, miras el archivo, te llevas una edición. El comprobante queda para las dos
            partes: tú lo guardas, nosotras sabemos qué imprimir y a qué buzón mandarlo.
          </p>
          <Link to="/tienda" className="btn-sticker ink mt-6 inline-flex px-6 py-2.5 text-base sm:mt-8 sm:w-auto sm:py-3">
            Ver ilustraciones
          </Link>
        </Reveal>
        <Reveal delay={0.08} className="relative z-10 mx-auto w-full max-w-md overflow-visible pb-0 sm:max-w-lg lg:z-auto lg:max-w-xl lg:pb-20">
          <TiltFrame>
            <ProtectedImg
              src="/brand/cherries.png"
              alt="Mascotas cereza de Kojurebi"
              className="frame w-full bg-pink object-contain"
            />
          </TiltFrame>
          <div className="pointer-events-none absolute z-10 hidden -rotate-6 lg:block lg:-bottom-4 lg:-left-64 lg:w-80">
            <ProtectedImg
              src="/brand/cards.png"
              alt="Tarjeta de visita Kojurebi"
              className="frame w-full bg-pink object-contain"
            />
          </div>
        </Reveal>
      </div>
      <div className="mx-auto mt-10 grid max-w-[1400px] gap-3 sm:mt-20 sm:grid-cols-3 sm:gap-4">
        {[
          {
            label: 'instagram',
            value: '@kojurebi',
            href: 'https://instagram.com/kojurebi',
            box: 'bg-pink-hot text-cream',
            hint: 'text-cream/80',
          },
          {
            label: 'correo',
            value: 'kojurebi@gmail.com',
            href: 'mailto:kojurebi@gmail.com',
            box: 'bg-yellow text-cobalt',
            hint: 'text-cobalt/70',
          },
          {
            label: 'web',
            value: 'www.kojurebi.com',
            href: 'https://www.kojurebi.com',
            box: 'bg-cobalt text-yellow',
            hint: 'text-cream',
          },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={item.href.startsWith('mailto:') ? undefined : 'noreferrer'}
            className={`block border-3 border-cobalt p-4 no-underline shadow-[8px_8px_0_#1D3A6E] transition duration-200 hover:-translate-y-1 sm:p-5 ${item.box}`}
          >
            <p className={`font-serif text-base italic sm:text-lg ${item.hint}`}>{item.label}</p>
            <p className="font-head break-all text-base font-extrabold sm:text-xl">{item.value}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
