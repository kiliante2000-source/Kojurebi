import { Link } from 'react-router-dom';
import { ProtectedImg } from '../components/shop/ProtectedArt';
import { cartKey } from '../utils/print';
import { cartTotals, useCartStore } from '../stores/cartStore';
import { formatMoney } from '../utils/money';

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const totals = cartTotals(items);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-head text-[2rem] font-extrabold sm:text-5xl">La bolsa está vacía</h1>
        <p className="font-serif mt-3 text-lg italic sm:text-2xl">Elige una edición y la guardamos aquí.</p>
        <Link to="/tienda" className="btn-sticker mt-8 inline-flex px-6 py-3">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 py-8 pb-28 lg:grid-cols-[1.3fr_0.7fr] lg:py-12 lg:pb-12">
      <div>
        <h1 className="font-head text-[2rem] sm:text-5xl">Tu bolsa</h1>
        <ul className="mt-6 space-y-4">
          {items.map((item) => (
            <li key={cartKey(item)} className="sticker flex gap-3 rounded-[1.4rem] p-3 sm:gap-4 sm:rounded-[1.8rem]">
              {item.imageUrl && (
                <ProtectedImg
                  src={item.imageUrl}
                  alt=""
                  className="h-20 w-20 rounded-2xl object-cover sm:h-24 sm:w-24"
                  wrapClassName="h-20 w-20 shrink-0 sm:h-24 sm:w-24"
                />
              )}
              <div className="min-w-0 flex-1">
                <Link to={`/tienda/${item.slug}`} className="font-head text-lg font-bold sm:text-xl">
                  {item.title}
                </Link>
                <p>{formatMoney(item.priceCents)}</p>
                <div className="mt-2 flex items-center gap-3">
                  <button className="tap" onClick={() => setQty(cartKey(item), item.quantity - 1)}>
                    −
                  </button>
                  <span className="font-head">{item.quantity}</span>
                  <button className="tap" onClick={() => setQty(cartKey(item), item.quantity + 1)}>
                    +
                  </button>
                  <button className="ml-auto underline" onClick={() => remove(cartKey(item))}>
                    quitar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <aside className="sticker-yellow hidden h-fit rounded-[2rem] border-3 border-cobalt p-6 lg:block">
        <h2 className="font-head text-2xl">Resumen</h2>
        <p className="mt-3 flex justify-between">
          <span>Subtotal</span>
          <span>{formatMoney(totals.subtotalCents)}</span>
        </p>
        <p className="mt-1 flex justify-between">
          <span>Envío</span>
          <span>{totals.shippingCents === 0 ? 'gratis ★' : formatMoney(totals.shippingCents)}</span>
        </p>
        <p className="font-head mt-4 flex justify-between text-xl">
          <span>Total</span>
          <span>{formatMoney(totals.totalCents)}</span>
        </p>
        <p className="font-serif mt-2 text-lg italic">Envío gratis a partir de 40€</p>
        <Link to="/checkout" className="btn-sticker pink mt-6 flex px-4 py-3">
          Datos y pago
        </Link>
      </aside>
      <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t-3 border-cobalt bg-yellow px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-head text-lg font-extrabold">{formatMoney(totals.totalCents)}</p>
            <p className="text-xs">
              {totals.shippingCents === 0 ? 'envío gratis ★' : `+ ${formatMoney(totals.shippingCents)} envío`}
            </p>
          </div>
          <Link to="/checkout" className="btn-sticker pink px-5 py-2">
            Datos y pago
          </Link>
        </div>
      </div>
    </div>
  );
}
