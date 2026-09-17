import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Order } from '../../types/shop';
import { ORDER_STATUS } from '../../types/shop';
import { formatMoney } from '../../utils/money';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get<{ orders: Order[] }>('/api/admin/orders').then((data) => setOrders(data.orders));
  }, []);

  return (
    <div>
      <p className="font-hand text-xl">qué imprimir y a dónde mandarlo</p>
      <h1 className="font-head text-4xl font-bold">Pedidos</h1>
      <div className="mt-6 grid gap-4">
        {orders.length === 0 && <p>Todavía no hay pedidos.</p>}
        {orders.map((order) => (
          <Link
            key={order.id}
            to={`/admin/pedidos/${order.id}`}
            className="sticker block rounded-[1.6rem] p-4 transition hover:-translate-y-1"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-head text-2xl">{order.number}</p>
              <span className="rounded-full bg-yellow px-3 py-1 text-sm font-bold">
                {ORDER_STATUS[order.status]}
              </span>
            </div>
            <p className="mt-1">
              {order.customerName} · {order.city} · {formatMoney(order.totalCents)}
            </p>
            <p className="text-sm opacity-80">
              {order.items.map((item) => `${item.quantity}× ${item.title}`).join(' · ')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
