import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { ShopStats } from '../../types/shop';
import { formatMoney } from '../../utils/money';

export function DashboardPage() {
  const [stats, setStats] = useState<ShopStats | null>(null);

  useEffect(() => {
    api.get<{ stats: ShopStats }>('/api/admin/orders/stats').then((data) => setStats(data.stats));
  }, []);

  const cards = [
    ['Ilustraciones', stats ? String(stats.productCount) : '…', '/admin/productos'],
    ['Pedidos', stats ? String(stats.orderCount) : '…', '/admin/pedidos'],
    ['Por empaquetar', stats ? String(stats.toFulfill) : '…', '/admin/pedidos'],
    ['Vendidas', stats ? formatMoney(stats.revenueCents) : '…', '/admin/pedidos'],
  ];

  return (
    <div>
      <p className="font-hand text-2xl">hola estudio</p>
      <h1 className="font-head text-4xl font-bold sm:text-6xl">Qué hay en el cajón</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value, to]) => (
          <Link key={label} to={to} className="sticker rounded-[1.8rem] p-5 transition hover:-translate-y-1">
            <p className="font-hand text-lg">{label}</p>
            <p className="font-head text-3xl">{value}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/admin/productos/nuevo" className="btn-sticker px-5 py-3">
          Subir un dibujo
        </Link>
        <Link to="/admin/pedidos" className="btn-sticker pink px-5 py-3">
          Ver envíos
        </Link>
        <Link to="/tienda" className="btn-sticker cream px-5 py-3">
          Mirar la tienda
        </Link>
      </div>
    </div>
  );
}
