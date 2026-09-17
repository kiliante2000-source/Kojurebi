import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import type { Product } from '../../types/shop';
import { CATEGORIES } from '../../types/shop';
import { centsToEurosInput, eurosToCents } from '../../utils/money';
import { ImageCarousel } from '../../components/shop/ImageCarousel';

const blank = {
  title: '',
  description: '',
  price: '12.00',
  category: 'print',
  stock: '12',
  format: 'Print A4',
  featured: false,
  published: true,
};

export function ProductFormPage() {
  const { id } = useParams();
  const isNew = !id;
  const navigate = useNavigate();
  const [form, setForm] = useState(blank);
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<{ product: Product }>(`/api/admin/products/${id}`).then((data) => {
      setProduct(data.product);
      setForm({
        title: data.product.title,
        description: data.product.description,
        price: centsToEurosInput(data.product.priceCents),
        category: data.product.category,
        stock: String(data.product.stock),
        format: data.product.format,
        featured: data.product.featured,
        published: data.product.published,
      });
    });
  }, [id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priceCents: eurosToCents(form.price),
        category: form.category,
        stock: Number(form.stock),
        format: form.format,
        featured: form.featured,
        published: form.published,
      };
      if (isNew) {
        const data = await api.post<{ product: Product }>('/api/admin/products', payload);
        navigate(`/admin/productos/${data.product.id}`);
      } else {
        const data = await api.patch<{ product: Product }>(`/api/admin/products/${id}`, payload);
        setProduct(data.product);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files || !id) return;
    for (const file of [...files]) {
      await api.upload(`/api/admin/products/${id}/images`, file, form.title);
    }
    const data = await api.get<{ product: Product }>(`/api/admin/products/${id}`);
    setProduct(data.product);
  }

  return (
    <div className="max-w-3xl">
      <Link to="/admin/productos" className="underline">
        ← ilustraciones
      </Link>
      <h1 className="font-head mt-2 text-4xl">{isNew ? 'Subir un dibujo' : 'Editar ilustración'}</h1>
      <form className="sticker mt-6 grid gap-3 rounded-[2rem] p-6" onSubmit={save}>
        <input
          className="field"
          required
          placeholder="Título"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          className="field min-h-32"
          required
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Precio (€)
            <input
              className="field"
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Stock
            <input
              className="field"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-bold">
            Tipo
            <select
              className="field"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold">
            Formato
            <input
              className="field"
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value })}
            />
          </label>
        </div>
        <label className="flex items-center gap-2 font-head">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Destacar en portada
        </label>
        <label className="flex items-center gap-2 font-head">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Visible en la tienda
        </label>
        {error && <p className="text-cherry">{error}</p>}
        <button disabled={busy} className="btn-sticker px-5 py-3">
          {busy ? 'Guardando…' : 'Guardar'}
        </button>
      </form>

      {!isNew && (
        <section className="mt-8">
          <h2 className="font-head text-2xl font-extrabold">Carrusel de imágenes</h2>
          <p className="font-serif text-lg italic">
            Sube varias fotos. En la tienda se verán en el mismo marco: deslizar, flechas y miniaturas. La primera es
            la de portada.
          </p>
          <input className="mt-3" type="file" accept="image/*" multiple onChange={(e) => void onFiles(e.target.files)} />
          {product && product.images.length > 0 && (
            <div className="frame mt-5 max-w-md overflow-hidden">
              <ImageCarousel images={product.images} aspect="aspect-[4/5]" showThumbs />
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {product?.images.map((image) => (
              <div key={image.id} className="sticker w-32 overflow-hidden">
                <img src={image.url} alt="" className="h-24 w-full object-cover" />
                <button
                  className="w-full py-1 text-sm underline"
                  onClick={async () => {
                    await api.delete(`/api/admin/products/${id}/images/${image.id}`);
                    const data = await api.get<{ product: Product }>(`/api/admin/products/${id}`);
                    setProduct(data.product);
                  }}
                >
                  quitar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
