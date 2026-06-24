# AURA OS CORE - Single Source of Truth (SSOT)

> **⚠️ IMPORTANTE PARA EL AGENTE:**
> ES OBLIGATORIO ACTUALIZAR ESTE DOCUMENTO CON CADA NUEVA FEATURE IMPLEMENTADA. ESTE ES EL MANIFIESTO Y LA FUENTE ÚNICA DE LA VERDAD.

## 1. Arquitectura y Stack Tecnológico
- **Framework:** Next.js (App Router) + React
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS (Sistema "Lujo 2040": minimalista, glassmorphism, modo oscuro por defecto)
- **Animaciones/Interacciones:** Framer Motion (micro-interacciones, tilt cards, orbs)
- **Autenticación:** Supabase Auth (OAuth con Google - Apple Sign-In removido temporalmente)
- **Base de Datos:** Supabase PostgreSQL

## 2. Flujos Críticos y Seguridad

### 2.1 Autenticación y Middleware
- Se utiliza `@supabase/ssr` en `src/middleware.ts` para mantener la sesión activa sin fricción.
- **Regla de Redirección:**
  - Usuarios autenticados no pueden ver `/` ni `/login`, son redirigidos a `/dashboard`.
  - Usuarios no autenticados que intentan entrar a `/dashboard` son redirigidos a `/`.

### 2.2 Atajo de iOS y Webhook (Ingesta de Datos)
- El usuario descarga un Atajo de iCloud que extrae el monto de notificaciones o pantalla y hace un POST al Webhook.
- **Webhook Endpoint:** `POST /api/webhook/yape`
- **Seguridad del Webhook:**
  - El usuario provee un `webhook_token` (generado automáticamente al crear su perfil).
  - El endpoint utiliza `SUPABASE_SERVICE_ROLE_KEY` (admin client) para saltarse las restricciones de Row Level Security (RLS) y poder insertar la transacción. Esto es seguro porque el insert se realiza atando la transacción al `user_id` asociado a ese token opaco y único.

### 2.3 Row Level Security (RLS)
- Todas las tablas (`profiles`, `transactions`) tienen RLS activado.
- Las políticas aseguran que un usuario (`auth.uid()`) solo pueda hacer SELECT/INSERT/UPDATE de sus propios registros.

## 3. Interfaz de Usuario (UI/UX)
- **Estética:** "Lujo 2040".
- **Componentes clave:**
  - Efectos visuales de desenfoque y radial gradients (Glassmorphism).
  - Insignias brillantes y texto responsivo.
  - Botones interactivos con hover states sutiles.
- **Dashboard:**
  - Muestra el balance en tiempo real con una suscripción a Supabase Realtime (`postgres_changes` para la tabla `transactions`).
  - Tarjetas de instalación y configuración de Webhook, con onboarding "dismissible" usando `localStorage`.

## 4. Estado Actual (V0.1)
- Integración de Webhook funcional.
- Dashboard con totalizadores y listado de transacciones.
- Sincronización Realtime activa y funcional.
- Flujo de Onboarding con opción de descartarse.
- OAuth centralizado en Google.
