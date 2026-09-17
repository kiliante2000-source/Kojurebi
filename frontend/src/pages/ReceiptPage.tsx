import { useEffect, useState } from 'react';
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import type { Order } from '../types/shop';
import { formatMoney } from '../utils/money';
import { ORDER_STATUS } from '../types/shop';
import { useCartStore } from '../stores/cartStore';

export function ReceiptPage() {
  const { number } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const stateOrder = (location.state as { order?: Order } | null)?.order;
  const token = params.get('t') || stateOrder?.receiptToken || '';
  const [order, setOrder] = useState<Order | null>(stateOrder ?? null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      useCartStore.getState().clear();
    }
  }, [order]);

  useEffect(() => {
    if (stateOrder && stateOrder.number === number) {
      setOrder(stateOrder);
      setError(null);
      return;
    }
    if (!number || !token) {
      setError('Falta el enlace del comprobante. Si acabas de pagar, no cierres esta pestaña.');
      return;
    }
    api
      .get<{ order: Order }>(`/api/orders/${encodeURIComponent(number)}?t=${encodeURIComponent(token)}`)
      .then((data) => {
        setOrder(data.order);
        setError(null);
      })
      .catch((e: Error) => setError(e.message));
  }, [number, token, stateOrder]);

  if (error && !order) {
    return (
      <div className="relative z-10 mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-head text-4xl">{error}</h1>
        <Link to="/tienda" className="btn-sticker mt-6 inline-flex px-5 py-2">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="relative z-10 px-4 py-20 text-center font-head">Cargando comprobante…</div>;
  }

  return (
    <div className="relative z-10 mx-auto max-w-2xl px-4 py-12">
      <div className="no-print mb-6 flex gap-3">
        <button className="btn-sticker px-5 py-2" onClick={() => window.print()}>
          Imprimir / guardar PDF
        </button>
        <Link to="/tienda" className="btn-sticker cream px-5 py-2">
          Seguir mirando
        </Link>
      </div>
      <article className="sticker receipt-paper rounded-[1.4rem] p-5 sm:rounded-[2rem] sm:p-8">
        <p className="font-hand text-lg sm:text-xl">Kojurebi · comprobante de compra</p>
        <h1 className="font-display text-4xl text-yellow sm:text-5xl">{order.number}</h1>
        <p className="font-head mt-2">
          {ORDER_STATUS[order.status]} · {new Date(order.paidAt).toLocaleString('es-ES')}
        </p>
        <ul className="mt-6 space-y-3 border-y-4 border-dashed border-cobalt py-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span>
                {item.quantity} × {item.title}
              </span>
              <span>{formatMoney(item.unitCents * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex justify-between">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotalCents)}</span>
        </p>
        <p className="flex justify-between">
          <span>Envío</span>
          <span>{order.shippingCents === 0 ? 'gratis' : formatMoney(order.shippingCents)}</span>
        </p>
        <p className="font-head mt-2 flex justify-between text-2xl">
          <span>Total</span>
          <span>{formatMoney(order.totalCents)}</span>
        </p>
        <p className="mt-2 text-sm">Pago con tarjeta •••• {order.paymentLast4}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <h2 className="font-head text-lg">Cliente</h2>
            <p>{order.customerName}</p>
            <p>{order.email}</p>
            {order.phone && <p>{order.phone}</p>}
          </div>
          <div>
            <h2 className="font-head text-lg">Enviar a</h2>
            <p>{order.addressLine1}</p>
            {order.addressLine2 && <p>{order.addressLine2}</p>}
            <p>
              {order.postalCode} {order.city}
            </p>
            <p>
              {order.province ? `${order.province}, ` : ''}
              {order.country}
            </p>
          </div>
        </div>
        {order.notes && <p className="mt-4 italic">Nota: {order.notes}</p>}
        <p className="font-hand mt-8 text-xl">good ideas, sweeter days ♡</p>
      </article>
    </div>
  );
}
