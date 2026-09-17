# Kojurebi API

Express + TypeScript + Prisma. Puerto **45322**.

## Arranque

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Health: http://127.0.0.1:45322/api/health

## Qué hay aquí

| Ruta | Qué hace |
| --- | --- |
| `prisma/` | Esquema SQLite, migraciones y seed del catálogo real |
| `src/routes/` | Auth, catálogo, checkout, admin |
| `src/services/` | Productos, pedidos, subida de fotos |
| `src/tests/` | Tests de la tienda |

## Endpoints

| Método | Ruta | Quién |
| --- | --- | --- |
| GET | `/api/health` | Público |
| GET | `/api/catalog/products` | Público |
| GET | `/api/catalog/products/:slug` | Público |
| POST | `/api/checkout` | Público |
| GET | `/api/orders/:number?t=token` | Quien tiene el comprobante |
| POST | `/api/auth/login` | Estudio |
| * | `/api/admin/products` | Estudio (cookie JWT) |
| * | `/api/admin/orders` | Estudio (cookie JWT) |

Las fotos de productos viven en `uploads/` (ignorado por git). El seed usa las imágenes de `frontend/public/shop`.
