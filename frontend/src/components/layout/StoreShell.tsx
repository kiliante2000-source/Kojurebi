import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Cursor, Wordmark } from '../brand/Decor';
import { ProtectedImg } from '../shop/ProtectedArt';
import { useArtworkGuard } from '../../hooks/useArtworkGuard';
import { useCartStore, cartTotals } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';

const links = [
  { to: '/tienda', label: 'Shop' },
  { to: '/estudio', label: 'Estudio' },
];

export function StoreShell() {
  const items = useCartStore((s) => s.items);
  const { count } = cartTotals(items);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  useArtworkGuard();

  return (
    <div className="store-skin flex min-h-svh flex-col bg-cream text-cobalt">
      <Cursor />
      <header className="no-print sticky top-0 z-50 overflow-visible bg-cobalt pb-1.5 pt-[env(safe-area-inset-top)] text-cream">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-4 sm:py-3 md:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-1.5 sm:gap-3">
            <ProtectedImg
              src="/brand/cherries.png"
              alt="Kojurebi"
              className="brand-mark h-7 w-7 shrink-0 sm:h-12 sm:w-12"
            />
            <Wordmark className="whitespace-nowrap text-[0.8rem] max-[380px]:text-[0.72rem] sm:text-4xl" />
          </Link>
          <nav className="flex shrink-0 items-center gap-3.5 sm:gap-6 md:gap-8">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center px-1.5 font-head text-[11px] font-extrabold uppercase tracking-[0.08em] link-underline sm:min-h-0 sm:px-0 sm:text-sm sm:tracking-[0.14em] ${
                    isActive ? 'text-yellow' : 'text-cream'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link
              to="/carrito"
              className="relative inline-flex min-h-11 items-center border-3 border-cobalt bg-yellow px-2.5 py-1 font-head text-[11px] font-extrabold uppercase tracking-wide text-cobalt shadow-[4px_4px_0_#1D3A6E] sm:min-h-10 sm:px-3 sm:text-sm"
            >
              Bolsa
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center bg-cobalt px-1 text-[10px] text-yellow"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            {user ? (
              <Link to="/admin" className="font-serif hidden text-sm italic text-yellow md:inline">
                backstage
              </Link>
            ) : (
              <Link to="/admin/login" className="font-serif hidden text-sm italic text-yellow md:inline">
                estudio
              </Link>
            )}
          </nav>
        </div>
      </header>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-1 flex-col"
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
      <footer className="no-print mt-auto overflow-hidden border-t-3 border-cobalt bg-cobalt pb-[max(2.5rem,env(safe-area-inset-bottom))] text-cream">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-8 md:grid-cols-3 md:gap-10 md:px-8 md:py-16">
          <div>
            <Wordmark className="text-[1.85rem] sm:text-5xl" />
            <p className="font-serif mt-3 text-lg italic text-yellow sm:mt-4 sm:text-2xl">art things people ♡</p>
            <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-cream/75">
              Estudio de ilustración. Prints, stickers y piezas únicas con grano de rotulador, enviados a tu casa.
            </p>
          </div>
          <div className="font-head space-y-2 text-sm uppercase tracking-[0.16em]">
            <p>@kojurebi</p>
            <p>kojurebi@gmail.com</p>
            <p>www.kojurebi.com</p>
            <p className="pt-4 text-yellow sm:pt-6">good ideas · sweeter days</p>
          </div>
          <div className="flex flex-col gap-3 font-head text-sm uppercase tracking-[0.14em]">
            <Link to="/tienda" className="link-underline w-fit">
              Catálogo
            </Link>
            <Link to="/estudio" className="link-underline w-fit">
              El estudio
            </Link>
            <Link to="/admin/login" className="link-underline w-fit">
              Administrar
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
