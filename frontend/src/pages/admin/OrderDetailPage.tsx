import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { Order } from '../../types/shop';
import { ORDER_STATUS } from '../../types/shop';
import { formatMoney } from '../../utils/money';

const nextStatus = ['paid', 'packing', 'shipped', 'delivered', 'cancelled'] as const;

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  async function load() {
    if (!id) return;
    const data = await api.get<{ order: Order }>(`/api/admin/orders/${id}`);
    setOrder(data.order);
  }

  useEffect(() => {
    void load();
  }, [id]);

  if (!order) {
    return <p className="font-head">Abriendo pedido…</p>;
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/pedidos" className="underline">
        ← pedidos
      </Link>
      <h1 className="font-display mt-2 text-5xl text-yellow">{order.number}</h1>
      <p className="font-head text-xl">{ORDER_STATUS[order.status]}</p>

      <section className="sticker mt-6 rounded-[1.8rem] p-5">
        <h2 className="font-head text-2xl">Qué preparar</h2>
        <ul className="mt-3 space-y-2">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              {item.imageUrl && <img src={item.imageUrl} alt="" className="h-14 w-14 rounded-xl object-cover" />}
              <span className="flex-1">
                {item.quantity} × {item.title}
              </span>
              <span>{formatMoney(item.unitCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="font-head mt-4 text-xl">Total {formatMoney(order.totalCents)}</p>
        <p className="text-sm">Tarjeta •••• {order.paymentLast4}</p>
      </section>

      <section className="sticker mt-4 rounded-[1.8rem] p-5">
        <h2 className="font-head text-2xl">Dónde enviarlo</h2>
        <p className="mt-2">{order.customerName}</p>
        <p>{order.email}</p>
        {order.phone && <p>{order.phone}</p>}
        <p className="mt-3">{order.addressLine1}</p>
        {order.addressLine2 && <p>{order.addressLine2}</p>}
        <p>
          {order.postalCode} {order.city}
        </p>
        <p>
          {order.province ? `${order.province}, ` : ''}
          {order.country}
        </p>
        {order.notes && <p className="mt-3 italic">Nota: {order.notes}</p>}
      </section>

      <div className="mt-6 flex flex-wrap gap-2">
        {nextStatus.map((status) => (
          <button
            key={status}
            className={`font-head rounded-full border-4 border-cobalt px-4 py-1 ${
              order.status === status ? 'bg-yellow' : 'bg-cream'
            }`}
            onClick={async () => {
              const data = await api.patch<{ order: Order }>(`/api/admin/orders/${order.id}`, { status });
              setOrder(data.order);
            }}
          >
            {ORDER_STATUS[status]}
          </button>
        ))}
      </div>
      <a
        className="mt-6 inline-block underline"
        href={`/pedido/${order.number}?t=${order.receiptToken}`}
        target="_blank"
        rel="noreferrer"
      >
        Abrir comprobante del cliente
      </a>
    </div>
  );
}
