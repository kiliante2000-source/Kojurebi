import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Wordmark } from '../brand/Decor';

const links = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/productos', label: 'Ilustraciones' },
  { to: '/admin/pedidos', label: 'Pedidos' },
];

export function AdminShell() {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  return (
    <div className="min-h-svh bg-cream text-cobalt">
      <div className="grid min-h-svh lg:grid-cols-[240px_1fr]">
        <aside className="border-b-4 border-cobalt bg-pink p-5 lg:border-b-0 lg:border-r-4">
          <Link to="/" className="block">
            <Wordmark className="text-3xl" />
          </Link>
          <p className="font-serif mt-1 text-sm italic">panel</p>
          <nav className="mt-6 flex flex-row gap-2 lg:flex-col">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `font-head rounded-2xl border-3 border-cobalt px-3 py-2 text-sm font-bold ${
                    isActive ? 'bg-yellow' : 'bg-cream'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-8 hidden text-sm lg:block">
            <p className="font-bold">{user?.name}</p>
            <p className="opacity-70">{user?.email}</p>
            <button
              className="btn-sticker mt-4 px-3 py-1 text-sm"
              onClick={async () => {
                await logout();
                navigate('/admin/login');
              }}
            >
              Salir
            </button>
          </div>
        </aside>
        <div className="p-4 sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
