import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Wordmark } from '../../components/brand/Decor';

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const loading = useAuthStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/admin';
  const [email, setEmail] = useState('estudio@kojurebi.com');
  const [password, setPassword] = useState('kojurebi1234');

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate(from, { replace: true });
    }
  }, [user, from, navigate]);

  return (
    <div className="store-skin grain grid min-h-svh place-items-center bg-cream px-4 py-12">
      <form
        className="frame w-full max-w-md p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await login(email, password);
            navigate(from, { replace: true });
          } catch {
            /* el error ya está en el store */
          }
        }}
      >
        <Wordmark className="text-5xl" />
        <p className="font-serif mt-2 text-xl italic">solo el estudio entra aquí</p>
        <p className="mt-2 text-sm opacity-70">
          Las clientas no necesitan cuenta. Este acceso es para subir dibujos, precios y ver a dónde enviar los
          pedidos.
        </p>
        <input
          className="field mt-6"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email del estudio"
        />
        <input
          className="field mt-3"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
        />
        {error && <p className="mt-3 font-head text-cherry">{error}</p>}
        <button disabled={loading} className="btn-sticker mt-5 w-full py-3">
          {loading ? 'Abriendo…' : 'Entrar al estudio'}
        </button>
        <Link to="/" className="mt-4 block text-center underline">
          Volver a la tienda
        </Link>
      </form>
    </div>
  );
}
