import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '../services/api';
import { cartTotals, useCartStore } from '../stores/cartStore';
import type { Order } from '../types/shop';
import { formatMoney } from '../utils/money';

const emptyForm = {
  customerName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  province: '',
  country: 'España',
  notes: '',
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
};

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const totals = cartTotals(items);
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  if (items.length === 0 && !busy) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-head text-4xl">No hay nada que enviar todavía</h1>
        <Link to="/tienda" className="btn-sticker mt-6 inline-flex px-5 py-2">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const data = await api.post<{ order: Order }>('/api/checkout', {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          edition: item.edition,
        })),
        customerName: form.customerName,
        email: form.email,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        postalCode: form.postalCode,
        province: form.province,
        country: form.country,
        notes: form.notes,
        payment: {
          cardName: form.cardName,
          cardNumber: form.cardNumber.replace(/\s+/g, ''),
          expiry: form.expiry,
          cvc: form.cvc,
        },
      });
      const order = data.order;
      navigate(
        {
          pathname: `/pedido/${order.number}`,
          search: `?t=${encodeURIComponent(order.receiptToken)}`,
        },
        { state: { order } },
      );
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo completar el pago');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-8 md:py-12">
      <p className="font-hand text-lg sm:text-xl">paso {step} de 2</p>
      <h1 className="font-head text-[2rem] leading-[0.92] sm:text-5xl">
        {step === 1 ? '¿A dónde lo enviamos?' : 'Pagar y listo'}
      </h1>
      <div className="mt-4 flex gap-2">
        <span className={`h-3 flex-1 ${step >= 1 ? 'bg-cobalt' : 'bg-cream'}`} />
        <span className={`h-3 flex-1 ${step >= 2 ? 'bg-cobalt' : 'bg-cream'}`} />
      </div>

      {step === 1 ? (
        <form
          className="sticker mt-8 grid gap-3 rounded-[1.4rem] p-4 sm:rounded-[2rem] sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(2);
          }}
        >
          <input className="field" required placeholder="Nombre y apellidos" value={form.customerName} onChange={set('customerName')} />
          <input className="field" required type="email" placeholder="Email para el comprobante" value={form.email} onChange={set('email')} />
          <input className="field" placeholder="Teléfono (opcional)" value={form.phone} onChange={set('phone')} />
          <input className="field" required placeholder="Dirección" value={form.addressLine1} onChange={set('addressLine1')} />
          <input className="field" placeholder="Piso, puerta, local…" value={form.addressLine2} onChange={set('addressLine2')} />
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" required placeholder="Ciudad" value={form.city} onChange={set('city')} />
            <input className="field" required placeholder="Código postal" value={form.postalCode} onChange={set('postalCode')} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="field" placeholder="Provincia" value={form.province} onChange={set('province')} />
            <input className="field" required placeholder="País" value={form.country} onChange={set('country')} />
          </div>
          <textarea className="field min-h-24" placeholder="Notas para el paquete" value={form.notes} onChange={set('notes')} />
          <button className="btn-sticker mt-2 w-full px-5 py-3 sm:w-auto">Continuar al pago</button>
        </form>
      ) : (
        <form className="sticker mt-8 grid gap-3 rounded-[1.4rem] p-4 sm:rounded-[2rem] sm:p-6" onSubmit={pay}>
          <p className="font-hand text-lg">
            Pago de demostración: no se cobra de verdad. Tarjeta de prueba <b>4242 4242 4242 4242</b>. Para ver un
            rechazo usa <b>4000 0000 0000 0002</b>. Caducidad futura y CVC 123.
          </p>
          <input className="field" required placeholder="Nombre en la tarjeta" value={form.cardName} onChange={set('cardName')} />
          <input className="field" required placeholder="Número de tarjeta" value={form.cardNumber} onChange={set('cardNumber')} />
          <div className="grid grid-cols-2 gap-3">
            <input
              className="field"
              required
              placeholder="MM/AA"
              value={form.expiry}
              inputMode="numeric"
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                const next = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                setForm((prev) => ({ ...prev, expiry: next }));
              }}
            />
            <input className="field" required placeholder="CVC" value={form.cvc} onChange={set('cvc')} />
          </div>
          <div className="sticker-yellow mt-2 rounded-2xl p-4">
            <p className="flex justify-between">
              <span>{totals.count} artículos</span>
              <span>{formatMoney(totals.subtotalCents)}</span>
            </p>
            <p className="flex justify-between">
              <span>Envío a {form.city || 'tu casa'}</span>
              <span>{totals.shippingCents === 0 ? 'gratis' : formatMoney(totals.shippingCents)}</span>
            </p>
            <p className="font-head mt-2 flex justify-between text-xl">
              <span>Total</span>
              <span>{formatMoney(totals.totalCents)}</span>
            </p>
          </div>
          {error && <p className="font-head text-cherry">{error}</p>}
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" className="btn-sticker cream px-5 py-3" onClick={() => setStep(1)}>
              Volver
            </button>
            <button disabled={busy} className="btn-sticker pink px-5 py-3" type="submit">
              {busy ? 'Cobrando…' : `Pagar ${formatMoney(totals.totalCents)}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
