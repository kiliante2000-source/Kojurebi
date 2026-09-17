# Arquitectura — Kojurebi Shop

Tienda online de ilustración: catálogo público, checkout de invitada y back-office del estudio.

## 1. Visión

Las clientas navegan y compran **sin cuenta**. El estudio entra con login para subir dibujos (imagen, texto, precio, stock) y para ver qué hay que imprimir y a qué dirección mandarlo. Cada pago genera un comprobante compartido.

Identidad: rosa chicle, cobalto, amarillo, grano y stickers. Movimiento tipo Readymag, no un grid de e-commerce genérico.

## 2. Sistema

```
┌─────────────┐     HTTPS/JSON      ┌──────────────────┐
│  Frontend   │ ◄─────────────────► │  Backend API     │
│  Vite+React │   Cookie JWT admin  │  Express + TS    │
│  Zustand    │                     │  Prisma / Zod    │
└─────────────┘                     └────────┬─────────┘
                                             │
                                    ┌────────┴────────┐
                                    │ SQLite / MySQL  │
                                    │ uploads/ imágenes│
                                    └─────────────────┘
```

## 3. Roles

- **Público**: catálogo, ficha, bolsa, checkout, comprobante por token.
- **Admin (estudio)**: CRUD de productos e imágenes, listado de pedidos, cambio de estado, estadísticas.

El registro público está cerrado. Solo se permite crear el primer usuario (o en `NODE_ENV=test`).

## 4. Pedido y pago

1. La bolsa vive en `localStorage` (Zustand persist).
2. `POST /api/checkout` valida stock, cobra una **pasarela simulada** (no se guarda el número completo, solo last4) y crea el pedido en una transacción.
3. Se descuenta stock. Envío 4,90 €; gratis desde 40 €.
4. Respuesta: `number` (`KOJ-XXXXXX`) + `receiptToken`.
5. Cliente: `GET /api/orders/:number?t=token`.
6. Admin ve el mismo pedido con dirección y líneas a preparar.

La simulación está lista para sustituirse por Stripe/Redsys más adelante sin cambiar el modelo de `Order`.

## 5. Seguridad

- Contraseñas bcrypt (cost 12)
- JWT httpOnly, SameSite=Lax
- Helmet + CORS + rate limit en auth y checkout
- Imágenes: whitelist MIME, límite 8 MB, nombres UUID
- Comprobantes: no se listan en público, hace falta el token

## 6. Infra

- Dev: Vite `:45321` + API `:45322` + SQLite
- Prod: Docker Compose → Nginx (estáticos + `/api` + `/uploads`) → API
