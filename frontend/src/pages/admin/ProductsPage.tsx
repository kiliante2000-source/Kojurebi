import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import type { Product } from '../../types/shop';
import { formatMoney } from '../../utils/money';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);

  async function load() {
    const data = await api.get<{ products: Product[] }>('/api/admin/products');
    setProducts(data.products);
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-hand text-xl">el inventario</p>
          <h1 className="font-head text-4xl font-bold">Ilustraciones</h1>
        </div>
        <Link to="/admin/productos/nuevo" className="btn-sticker px-5 py-2">
          Nueva ilustración
        </Link>
      </div>
      <div className="mt-6 grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="sticker flex flex-wrap items-center gap-4 rounded-[1.6rem] p-3">
            {product.images[0] && (
              <img src={product.images[0].url} alt="" className="h-20 w-20 rounded-2xl object-cover" />
            )}
            <div className="flex-1">
              <p className="font-head text-xl">{product.title}</p>
              <p className="text-sm">
                {formatMoney(product.priceCents)} · stock {product.stock} · {product.published ? 'visible' : 'oculta'}
              </p>
            </div>
            <Link to={`/admin/productos/${product.id}`} className="underline">
              editar
            </Link>
            <button
              className="text-cherry underline"
              onClick={async () => {
                if (!confirm(`¿Quitar “${product.title}” del catálogo?`)) return;
                await api.delete(`/api/admin/products/${product.id}`);
                await load();
              }}
            >
              borrar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
