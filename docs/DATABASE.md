# Base de datos — Kojurebi

## Desarrollo

Prisma usa **SQLite** (`file:./dev.db`).

## Producción MySQL

1. En `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

2. `DATABASE_URL="mysql://USER:PASS@HOST:3306/kojurebi"`
3. `npx prisma migrate dev --name mysql_init`

## Modelos

- `User` — solo cuentas del estudio (`role=admin`)
- `Product` + `ProductImage` — ilustraciones a la venta
- `Order` + `OrderItem` — pedido pagado, dirección de envío, snapshot de artículos y token de comprobante
