# Gastos — control de gastos personales

Next.js 14 (App Router, TypeScript) + Supabase (Postgres + Auth) + Recharts.
Estética de boleta/recibo: fondo papel, cifras en monoespaciada, categorías
en líneas punteadas.

## 1. Configurar Supabase

1. En tu proyecto de Supabase, abre **SQL Editor** y ejecuta el contenido de
   [`supabase/schema.sql`](./supabase/schema.sql). Esto crea la tabla
   `expenses` con Row Level Security (cada usuario solo ve sus propios gastos).
2. Esta app es **solo login** (sin registro público). Crea el/los usuarios
   manualmente en **Authentication → Users → Add user** con email + contraseña.
3. Copia la URL del proyecto y la `anon` key desde **Project Settings → API**.

## 2. Variables de entorno

Copia `.env.local.example` a `.env.local` y completa con tus credenciales:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) — redirige a `/login` si
no hay sesión activa.

## 4. Deploy en Vercel

1. Importa el repositorio en Vercel.
2. En **Settings → Environment Variables**, agrega `NEXT_PUBLIC_SUPABASE_URL`
   y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (mismos valores que `.env.local`).
3. Deploy. No se requiere configuración adicional (sin servidor propio, sin
   variables secretas del lado del servidor).

## Estructura

- `supabase/schema.sql` — tabla `expenses`, políticas RLS.
- `src/lib/supabase/` — clientes de Supabase (browser, server, middleware).
- `middleware.ts` — protege todas las rutas excepto `/login`.
- `src/app/login/` — login (email/contraseña), sin registro.
- `src/app/page.tsx` — dashboard: totales, gráfico de torta, tendencia 30
  días, lista de gastos recientes.
- `src/app/actions.ts` — Server Actions: agregar/borrar gasto, cerrar sesión.
- `src/lib/categories.ts` — categorías predefinidas y su color fijo.
- `src/lib/date.ts` — fechas en zona horaria `America/Lima`.
