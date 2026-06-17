# 📘 AlNegocio — Documentación del Proyecto

> App SaaS de gestión para negocios y emprendimientos en Cuba
> (cafeterías, restaurantes, dulcerías, tiendas, etc.)
> Cada dueño paga una **suscripción mensual** para usarla.

Este documento está pensado para que un profesor o desarrollador entienda
rápidamente el proyecto y **ayude a terminar el backend en Supabase**.

---

## 1. ¿QUÉ ES Y QUÉ HACE?

AlNegocio es una aplicación web (PWA instalable) que permite a un dueño de
negocio gestionar todo desde su teléfono o PC:

- **Ventas** (punto de venta / POS)
- **Productos e inventario**
- **Insumos y recetas** (para negocios de elaboración: pastelerías, etc.)
- **Compras a proveedores**
- **Clientes y proveedores**
- **Empleados y nómina/salarios**
- **Contabilidad** (estado de resultados)
- **Reportes** (gráficos, exportación CSV)
- **Cuadre de turno** (cierre de caja: cuenta dinero y productos)
- **Tasa de cambio** (USD/EUR, con tasa de compra y de pago)
- **Usuarios y roles** (dueño / administrador / vendedor)
- **Mi suscripción** (el dueño paga su cuota mensual a la plataforma)

### Modelo de negocio (SaaS)
- El dueño se registra → 14 días de prueba gratis.
- Luego paga **2.500 CUP/mes** por **Transfermóvil o efectivo**.
- Al pagar, se genera una **solicitud** que llega al correo del administrador
  (`todoenoro56@gmail.com`) con dos botones: **Aprobar** / **Dejar en espera**.
- El administrador aprueba con **un clic** desde el correo → la suscripción se
  renueva automáticamente del lado del servidor.

---

## 2. TECNOLOGÍAS USADAS

| Capa | Tecnología |
|------|-----------|
| Frontend | **React + TypeScript + Vite** |
| Estilos | **Tailwind CSS** |
| Empaquetado | Vite (genera un único `index.html` autocontenido) |
| PWA | Service Worker + manifest (instalable y offline) |
| Backend | **Supabase** (PostgreSQL + Auth + Edge Functions) |
| Correos | **Resend** (API de envío de email) |
| Hosting recomendado | GitHub Pages / Netlify |

---

## 3. ESTRUCTURA DE CARPETAS (FRONTEND)

```
src/
├── App.tsx                  → App principal (menú lateral + navegación por roles)
├── RootApp.tsx              → Enrutador: flyer → login → app / muro de pago
├── main.tsx                 → Punto de entrada + registro del Service Worker
│
├── lib/                     → LÓGICA Y DATOS
│   ├── types.ts             → Tipos de datos (Producto, Venta, Insumo, Turno…)
│   ├── store.tsx            → Estado global del negocio (Context) + sincronización nube
│   ├── cloudRepo.ts         → Lee/escribe datos del negocio en Supabase (tiempo real)
│   ├── seed.ts              → Datos de ejemplo (modo demo)
│   ├── analytics.ts         → Cálculos (ganancias, totales, inventario)
│   ├── notifications.ts     → Genera avisos (stock bajo, turno cerrado, suscripción)
│   └── format.ts            → Formato de moneda (CUP), fechas, etc.
│
├── platform/                → CAPA SaaS (cuentas, suscripción, roles)
│   ├── config.ts            → ⚙️ CONFIG: claves Supabase, precio, tarjetas de cobro
│   ├── supabaseClient.ts    → Cliente de conexión a Supabase
│   ├── platformStore.tsx    → Auth (registro/login), sesión, roles, suscripción
│   ├── types.ts             → Tipos de la plataforma (Tenant, Member, Role…)
│   ├── roles.ts             → Permisos por rol (qué módulos ve cada uno)
│   ├── AuthScreens.tsx      → Pantallas de registro e inicio de sesión
│   ├── Suscripcion.tsx      → "Mi suscripción": pagar, estado, historial
│   ├── Flyer.tsx            → Página de presentación/publicidad
│   ├── Brand.tsx            → Nombre "AlNegocio" con estilo
│   └── InstallButton.tsx    → Botón "Instalar app" (PWA)
│
├── modules/                 → MÓDULOS DE GESTIÓN (cada sección de la app)
│   ├── Dashboard.tsx        → Resumen general
│   ├── Ventas.tsx           → Punto de venta (POS)
│   ├── Productos.tsx        → Productos (reventa o elaborado con receta)
│   ├── Insumos.tsx          → Materias primas
│   ├── Compras.tsx          → Compras a proveedores
│   ├── Contactos.tsx        → Clientes y proveedores
│   ├── Empleados.tsx        → Empleados y nómina
│   ├── Contabilidad.tsx     → Estado de resultados, gastos
│   ├── Reportes.tsx         → Gráficos y exportación
│   ├── Cuadre.tsx           → Cierre de turno (cuadre de caja)
│   ├── Cambio.tsx           → Tasa de cambio USD/EUR
│   ├── Usuarios.tsx         → Gestión de usuarios (dueño crea vendedores/admins)
│   └── Ajustes.tsx          → Configuración del negocio + notificaciones
│
└── components/              → COMPONENTES REUTILIZABLES
    ├── ui.tsx               → Botones, inputs, modales, tarjetas, etc.
    ├── icons.tsx            → Íconos SVG
    ├── Chart.tsx            → Gráficos de barras/dona
    └── NotificationsBell.tsx→ Campana de notificaciones
```

---

## 4. ESTRUCTURA DEL BACKEND (SUPABASE)

```
supabase/
├── schema.sql               → Tablas de cuentas y suscripciones (tenants,
│                              subscription_requests, invoices) + seguridad RLS
├── schema-business.sql      → Tablas de datos del negocio (products, sales,
│                              members con roles, etc.) + RLS + tiempo real
├── functions/
│   ├── request-subscription/ → El cliente envía solicitud de pago → email al admin
│   ├── approve-subscription/ → Botón "Aprobar" del correo → renueva (1 clic)
│   └── create-user/          → El dueño crea vendedores/administradores
└── README.md                → Instrucciones de despliegue
```

### Tablas principales (ya creadas en la base de datos)
- `tenants` → perfil de cada negocio (nombre, dueño, correo, fecha de vencimiento)
- `members` → usuarios de cada negocio con su **rol** (owner/admin/vendedor)
- `subscription_requests` → solicitudes de pago pendientes de aprobar
- `invoices` → pagos aprobados
- `products`, `sales`, `purchases`, `contacts`, `employees`, `expenses`,
  `categories` → datos del negocio (compartidos entre vendedores del mismo negocio)

### Seguridad (RLS — Row Level Security)
Cada negocio **solo ve sus propios datos**. La columna `paid_until`
(vencimiento de la suscripción) **NO se puede modificar desde el cliente**:
solo la Edge Function `approve-subscription` la cambia, usando la
`service_role key` (que nunca llega al navegador). Por eso un cliente
**no puede auto-renovarse** sin la aprobación del administrador.

---

## 5. CÓMO FUNCIONA LA APROBACIÓN DE PAGOS (LO IMPORTANTE)

```
1. El dueño paga (Transfermóvil/efectivo) y envía la solicitud desde la app.
2. La Edge Function "request-subscription":
   - Guarda la solicitud en la BD.
   - Genera un enlace firmado (HMAC con un secreto del servidor).
   - Envía un correo al admin con botones APROBAR / EN ESPERA.
3. El admin toca "APROBAR" en su correo.
4. La Edge Function "approve-subscription":
   - Verifica la firma HMAC (imposible de falsificar sin el secreto).
   - Actualiza paid_until en la BD (renueva la suscripción).
   - Crea la factura.
5. El cliente pulsa "Actualizar estado" en la app y ya tiene acceso.
```

---

## 6. ESTADO ACTUAL DEL PROYECTO

### ✅ YA HECHO
- [x] Todo el **frontend** (la app completa con todos los módulos).
- [x] **PWA** (instalable, funciona offline en la parte de gestión).
- [x] Logo, nombre, flyer publicitario.
- [x] Datos del proveedor configurados (tarjetas, precio 2500 CUP, correo).
- [x] Proyecto Supabase **creado**.
- [x] **Tablas creadas** (`schema.sql` y `schema-business.sql` ejecutados → OK).
- [x] **Authentication** configurado (confirmación de correo desactivada).

### ⏳ FALTA PARA TERMINAR (lo que necesito ayuda del profesor)
1. **Desplegar las 3 Edge Functions** en Supabase:
   - `request-subscription`
   - `approve-subscription`
   - `create-user`
2. **Configurar los "secretos" (Secrets)** del proyecto Supabase:
   - `APPROVE_SECRET` → frase secreta para firmar aprobaciones.
   - `ADMIN_EMAIL` → `todoenoro56@gmail.com`
   - `PLAN_PRICE` → `2500`
   - `RESEND_API_KEY` → clave de Resend (crear cuenta en resend.com).
   - `FROM_EMAIL` → remitente del correo.
   - (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` ya están
     disponibles automáticamente dentro de las funciones.)
3. **Conectar el frontend** con Supabase:
   - Pegar `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `src/platform/config.ts`
     (variables `MANUAL_SUPABASE_URL` y `MANUAL_SUPABASE_ANON_KEY`).
4. **Compilar y publicar** la app:
   - `npm run build` → genera `dist/index.html`
   - Subir a GitHub Pages o Netlify.

---

## 7. EL PROBLEMA QUE TENGO (CONTEXTO PARA EL PROFESOR)

Estoy en **Cuba** y al intentar desplegar las Edge Functions desde la terminal
me encuentro con bloqueos:

- `npm install -g supabase` ya **no funciona** (Supabase quitó esa vía):
  da `No matching Supabase CLI binary package found for win32-x64`.
- Al instalar **Scoop** (método oficial para Windows) o el CLI, sale el error
  **SSL/TLS "no se puede crear un canal seguro"** (bloqueo de IP cubana),
  incluso con VPN (Psiphon).

### Opciones para resolverlo (a discutir con el profesor)
- **A)** Instalar el **Supabase CLI** correctamente (con VPN estable) y desplegar
  las funciones con `supabase functions deploy`.
- **B)** Desplegar las funciones **desde el panel web de Supabase**
  (Edge Functions → Deploy a new function → Via Editor), pegando el código de
  cada función manualmente. *(Es la vía que estábamos intentando.)*
- **C)** Que el profesor (con conexión sin bloqueo) clone el proyecto y haga el
  `supabase functions deploy` desde su equipo, usando mi `--project-ref`.

---

## 8. COMANDOS ÚTILES (si se usa el CLI)

```bash
# Instalar dependencias del frontend
npm install

# Ver la app en desarrollo
npm run dev

# Compilar para producción (genera dist/index.html)
npm run build

# --- Backend (Supabase CLI) ---
supabase login
supabase link --project-ref <PROJECT_REF>
supabase functions deploy request-subscription
supabase functions deploy approve-subscription
supabase functions deploy create-user

# Configurar secretos
supabase secrets set APPROVE_SECRET="una-frase-larga-secreta"
supabase secrets set ADMIN_EMAIL="todoenoro56@gmail.com"
supabase secrets set PLAN_PRICE="2500"
supabase secrets set RESEND_API_KEY="re_xxxxx"
supabase secrets set FROM_EMAIL="AlNegocio <onboarding@resend.dev>"
```

---

## 9. NOTAS DE SEGURIDAD

- La `service_role key` y el `APPROVE_SECRET` son **secretos**: nunca van en el
  frontend ni en repositorios públicos. Solo viven en los Secrets de Supabase.
- El frontend solo usa la `anon key` (pública y segura, protegida por RLS).
- La fuente de verdad del estado "pagado" es la columna `paid_until` en la BD
  del servidor, no el navegador del cliente.

---

*Fin de la documentación. Cualquier duda, revisar `supabase/README.md` para los
pasos de despliegue detallados.*
