# Kojurebi

Tienda online del estudio de ilustración **Kojurebi**.

Catálogo público sin registro, bolsa, checkout con dirección y comprobante, y un panel privado para subir dibujos y preparar envíos.

Identidad: cerezas gemelas, rosa chicle, cobalto, amarillo neón y grano de lápiz. En portada, las estrellas, corazones y **arrástrame** se pueden coger. La etiqueta de las cerezas es **@kojurebi**.

Este repositorio **es la tienda**. La raíz del proyecto es `Kojurebi/` (`frontend/`, `backend/`, `docker/`, `docs/`). No forma parte de ningún TFM ni de otra carpeta padre.

## Catálogo y precios

El catálogo muestra **solo piezas reales**. El filtro Packs queda vacío hasta que se añada uno.

| Pieza | Tipo | Formato | Precio |
| --- | --- | --- | --- |
| Howl (Noche oscura / Estrellas fugaces) | Print | A5 / A4 / A3, apaisada | 8 € / 12 € / 16 € |
| Lilimon | Print | A5 / A4, apaisada | 8 € / 12 € |
| Ópalo | Print | A5 / A4 / A3, vertical | 8 € / 12 € / 16 € |
| Diamante blanco | Print | A5 / A4 / A3, vertical | 8 € / 12 € / 16 € |
| Chica Sol | Original | A5 / A4 / A3, vertical | 8 € / 12 € / 16 € |
| Celebi, Manaphy, Jirachi, Shaymin | Stickers | Pack de 2, cuadrado | 4 € |

## Stack

| Capa | Tecnología |
| --- | --- |
| Tienda | React 19, TypeScript, Vite, Zustand, Tailwind CSS v4, Framer Motion |
| API | Node.js, Express, TypeScript, Prisma, Zod, JWT (cookie httpOnly) |
| Datos | SQLite en local · MySQL en producción (cambiando el provider de Prisma) |
| Infra | Docker Compose, Nginx, GitHub Actions |

## Carpetas

```
Kojurebi/
├── frontend/                 # tienda que ve la clienta (Vite, puerto 45321)
│   ├── public/brand/         # cerezas, favicon, marca
│   ├── public/shop/          # prints y stickers reales
│   └── src/
│       ├── pages/            # Home, Tienda, Estudio, ficha, bolsa, checkout, admin
│       ├── components/       # marco, stickers, mosaico, protección de arte
│       ├── stores/           # bolsa y sesión del estudio
│       └── utils/            # precios, formatos A5/A4/A3, mosaico
├── backend/                  # API (puerto 45322)
│   ├── prisma/               # esquema, migraciones y seed del catálogo
│   └── src/                  # rutas, pedidos, productos, auth
├── docker/                   # Dockerfiles y Nginx
├── docs/                     # arquitectura, base de datos, roadmap
└── .github/workflows         # tests y build
```

| Carpeta | Para qué |
| --- | --- |
| `frontend/` | Toda la interfaz: portada, catálogo, ficha, bolsa, pago, estudio y admin |
| `backend/` | API, base de datos, subida de fotos, checkout y panel |
| `docker/` | Cómo se publica la tienda detrás de Nginx |
| `docs/` | Notas de arquitectura, datos y lo que falta (pasarela real, emails) |

## Arranque local

Requisitos: **Node.js 22** (ver `.nvmrc`; vale 20 o superior).

Desde la **raíz de este repo** (`Kojurebi/`), no desde una carpeta padre:

```bash
cp backend/.env.example backend/.env
npm install
npm run db:migrate --workspace=backend
npm run db:seed
npm run dev
```

- Tienda: http://127.0.0.1:45321
- API: http://127.0.0.1:45322/api/health

Vite envía `/api` y `/uploads` al backend.

### Dos terminales

```bash
# API
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev

# Tienda
cd frontend
npm install
npm run dev
```

### Estudio (admin)

Tras el seed:

| | |
| --- | --- |
| URL | http://127.0.0.1:45321/admin/login |
| Email | `estudio@kojurebi.com` |
| Contraseña | `kojurebi1234` |

Cámbiala antes de un entorno real. Las clientas **no se registran**: entran a `/tienda`, eligen y pagan en `/checkout`.

### Pago de demostración

No cobra de verdad. Caducidad futura y CVC `123`.

| Resultado | Tarjeta |
| --- | --- |
| OK | `4242 4242 4242 4242` |
| Rechazo | `4000 0000 0000 0002` |

Envío 4,90 €; gratis desde 40 €.

## Rutas de la tienda

| Ruta | Qué es |
| --- | --- |
| `/` | Portada |
| `/tienda` | Catálogo (Todas, Prints, Stickers, Packs, Originales) |
| `/tienda/:slug` | Ficha (tallas A5/A4/A3 y versiones de Howl) |
| `/carrito` · `/checkout` | Bolsa y pago |
| `/pedido/:number` | Comprobante |
| `/estudio` | Página del estudio |
| `/admin` | Panel (productos y pedidos) |

## Scripts

```bash
npm test                 # API + tienda
npm run build            # ambos
npm run db:seed          # catálogo real
npm run dev              # API y tienda a la vez
```

## Docker

```bash
docker compose up --build
docker compose exec api npx prisma db seed
```

- Web: http://localhost
- API: http://localhost:45322/api/health

## Añadir una pieza

1. Entra en `/admin/productos/nuevo`.
2. Título, texto, categoría, precio, stock, formato (`A5 / A4 / A3`, `Pack de 2`…).
3. Marco: `portrait`, `landscape` o `square` (el mosaico usa esa forma).
4. Sube las fotos. En prints puedes guardar tallas y, si hace falta, varias versiones (como Howl: Noche oscura / Estrellas fugaces).

Packs está preparado en los filtros y en el admin; el seed no incluye ninguno.

## Pasos importantes

- Trabaja siempre en la raíz **Kojurebi**, no dentro de otra carpeta de proyecto.
- Copia `backend/.env.example` a `backend/.env` antes del primer arranque.
- Si el catálogo sale vacío, corre `npm run db:seed`.
- Si Prisma se queja, `cd backend && npx prisma generate && npx prisma migrate dev`.
- Los puertos 45321 (tienda) y 45322 (API) tienen que estar libres.
- El código es MIT. Las ilustraciones de `frontend/public/brand` y `frontend/public/shop` son © Kojurebi y no se reutilizan fuera de esta tienda.

## Documentación

- [Arquitectura](docs/ARCHITECTURE.md)
- [API](backend/README.md)
- [Base de datos](docs/DATABASE.md)
- [Roadmap](docs/ROADMAP.md)
- [Tienda (frontend)](frontend/README.md)

## Licencia

El **código** se publica bajo [MIT](LICENSE).

Las **ilustraciones, marca y fotos** son © Kojurebi. Todos los derechos reservados.
