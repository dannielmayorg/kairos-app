# K.A.I.R.O.S.
### Kind of An Intelligent Reminder, Obviously Superior

PWA de gestión de proyectos, eventos y tareas con notificaciones push en tiempo real. Diseñada para mobile-first con una estética dark premium.

**Producción:** `kairostimeapp.vercel.app`

---

## Índice

1. [Stack técnico](#stack-técnico)
2. [Modelo de datos](#modelo-de-datos)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Páginas y rutas](#páginas-y-rutas)
5. [API REST](#api-rest)
6. [Sistema de notificaciones push](#sistema-de-notificaciones-push)
7. [Sistema de diseño](#sistema-de-diseño)
8. [Infraestructura](#infraestructura)
9. [Variables de entorno](#variables-de-entorno)
10. [Correr localmente](#correr-localmente)

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16.2 (App Router) |
| Base de datos | PostgreSQL vía Neon (serverless) |
| ORM | Prisma 5 |
| Estilos | Tailwind CSS 4 + inline styles |
| Fuente | Inter (next/font/google) |
| Push notifications | Web Push API (`web-push`) |
| Cron / cola de trabajos | Upstash QStash |
| Deploy | Vercel |
| Lenguaje | TypeScript 5 |
| Runtime | React 19 |

---

## Modelo de datos

```prisma
Proyecto
  id        String   @id @default(cuid())
  nombre    String
  color     String   @default("#6366f1")
  creadoEn  DateTime @default(now())
  eventos   Evento[]

Evento
  id                    String
  proyectoId            String          → Proyecto
  nombre                String
  descripcion           String?
  fechaInicio           DateTime
  fechaFin              DateTime
  categoria             REUNION | SESION | TALLER | OTRO
  estado                PENDIENTE | ACTIVO | COMPLETADO
  recurrencia           NINGUNA | DIARIA | SEMANAL | MENSUAL | PERSONALIZADA
  reglaRecurrencia      Json?           { intervalo, diasSemana, terminaCon, fechaFin, ocurrencias }
  eventoOriginalId      String?         (para series recurrentes)
  intervaloNotificacion Int             @default(15)  (minutos entre notificaciones push)
  ultimaNotificacion    DateTime?
  tareas                Tarea[]

Tarea
  id           String
  eventoId     String          → Evento
  titulo       String
  descripcion  String?
  prioridad    ALTA | MEDIA | BAJA
  completada   Boolean         @default(false)
  completadaEn DateTime?
  orden        Int             @default(0)
  creadoEn     DateTime

SuscripcionPush
  id       String
  endpoint String   @unique
  keys     Json     { p256dh, auth }
  creadaEn DateTime
```

**Relaciones:** `Proyecto → Eventos → Tareas` (cascade delete en todos los niveles).

---

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                          # Dashboard principal
│   ├── layout.tsx                        # Root layout (Inter font, viewport)
│   ├── globals.css                       # Design tokens + utilidades CSS
│   │
│   ├── nuevo-proyecto/page.tsx           # Formulario crear proyecto
│   ├── nuevo-evento/page.tsx             # Formulario crear evento (con recurrencia)
│   │
│   ├── proyectos/
│   │   ├── page.tsx                      # Lista de proyectos
│   │   └── [id]/page.tsx                 # Detalle de proyecto + lista de eventos
│   │
│   ├── eventos/
│   │   └── [id]/
│   │       ├── page.tsx                  # Detalle de evento + tareas
│   │       ├── EventoAcciones.tsx        # Botones cambiar estado + editar
│   │       ├── TareasPanel.tsx           # Lista interactiva de tareas
│   │       ├── editar/page.tsx           # Formulario editar evento
│   │       └── sesion/page.tsx           # Vista sesión activa (focus mode)
│   │
│   └── api/
│       ├── proyectos/
│       │   ├── route.ts                  # GET /api/proyectos, POST
│       │   └── [id]/route.ts             # GET, PATCH, DELETE
│       ├── eventos/
│       │   ├── route.ts                  # GET, POST (con generación de serie)
│       │   └── [id]/
│       │       ├── route.ts              # GET, PATCH, DELETE
│       │       ├── estado/route.ts       # PATCH → cambia estado
│       │       └── editar-futuros/route.ts  # POST → edita eventos futuros en serie
│       ├── tareas/
│       │   ├── route.ts                  # POST
│       │   └── [id]/
│       │       ├── route.ts              # DELETE
│       │       └── completar/route.ts    # PATCH → toggle completada
│       ├── push/
│       │   ├── suscribir/route.ts        # POST → registra suscripción push
│       │   └── enviar/route.ts           # POST → envía notificación
│       └── cron/
│           └── notificaciones/route.ts   # GET → llamado por QStash cada 5 min
│
├── components/
│   ├── Navbar.tsx                        # Bottom nav (Inicio / + Evento / Proyectos)
│   ├── PushSubscriber.tsx               # Registra service worker y suscripción
│   └── GoogleCalendarButton.tsx         # Link a Google Calendar
│
├── lib/
│   ├── prisma.ts                         # Cliente Prisma singleton
│   ├── syncEstados.ts                    # sincronizarEstados() — activa/completa eventos por fecha
│   ├── dateUtils.ts                      # formatFecha(), formatHora()
│   ├── googleCalendar.ts                 # urlGoogleCalendar()
│   └── webpush.ts                        # Helper enviar notificación push
│
└── worker/
    └── index.ts                          # Service Worker (PWA / push handler)
```

---

## Páginas y rutas

### Dashboard `/`
- Saludo dinámico (buenos días / tardes / noches)
- **Hero card amarilla** con el evento activo, progreso de tareas y CTA "Abrir sesión"
- Pills de stats: activos / próximos / proyectos
- Lista de próximos eventos (PENDIENTE, hasta 5)
- Grid 2 columnas de proyectos
- Sincroniza estados al cargar (`sincronizarEstados()`)

### Sesión activa `/eventos/[id]/sesion`
- Vista de foco sin Navbar
- Header sticky con botón "Completar"
- Info card con barra de progreso lime
- Lista de tareas pendientes (tap para completar)
- Lista de tareas completadas (lime checkmark, strikethrough)
- CTA "Completar evento" cuando todas están listas

### Detalle de evento `/eventos/[id]`
- Breadcrumb proyecto → evento
- Card con estado, descripción, horario, botón Google Calendar
- Botón "Abrir sesión activa" (solo si ACTIVO)
- Panel de tareas interactivo (agregar, completar, eliminar)
- `EventoAcciones`: cambiar estado + link a editar

### Crear evento `/nuevo-evento`
Formulario completo:
- Selección de proyecto
- Nombre, descripción
- Fecha y horas (inicio → fin)
- Repetición: ninguna / diaria / semanal / mensual / personalizada
  - Selección de días de la semana (para SEMANAL / PERSONALIZADA)
  - Termina: en fecha o después de N sesiones
- Categoría: Reunión / Sesión / Taller / Otro
- Recordatorio push: 10 / 15 / 20 / 30 / 45 / 60 min
- Tareas iniciales (múltiples, dinámicas)

### Editar evento `/eventos/[id]/editar`
- Igual que crear, pero precargado
- Para eventos en serie: opción "Solo este" o "Este y los siguientes"

### Proyectos `/proyectos`
- Lista de todos los proyectos con color, nombre y conteo de eventos

### Detalle de proyecto `/proyectos/[id]`
- Lista de eventos del proyecto con estado, categoría, fecha y conteo de tareas

### Nuevo proyecto `/nuevo-proyecto`
- Nombre + selector de color con preview en tiempo real

---

## API REST

### Proyectos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/proyectos` | Lista todos los proyectos |
| `POST` | `/api/proyectos` | Crea proyecto `{ nombre, color }` |
| `GET` | `/api/proyectos/[id]` | Obtiene proyecto por ID |
| `PATCH` | `/api/proyectos/[id]` | Actualiza proyecto |
| `DELETE` | `/api/proyectos/[id]` | Elimina proyecto (cascade) |

### Eventos

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/eventos` | Lista eventos (`?proyectoId=`, `?estado=PENDIENTE\|ACTIVO\|COMPLETADO`) |
| `POST` | `/api/eventos` | Crea evento (genera serie si hay recurrencia) |
| `GET` | `/api/eventos/[id]` | Obtiene evento con proyecto y tareas |
| `PATCH` | `/api/eventos/[id]` | Actualiza campos del evento |
| `DELETE` | `/api/eventos/[id]` | Elimina evento |
| `PATCH` | `/api/eventos/[id]/estado` | Cambia estado `{ estado }` |
| `POST` | `/api/eventos/[id]/editar-futuros` | Aplica cambios a eventos futuros de la serie |

### Tareas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/tareas` | Crea tarea `{ eventoId, titulo, orden }` |
| `DELETE` | `/api/tareas/[id]` | Elimina tarea |
| `PATCH` | `/api/tareas/[id]/completar` | Toggle `completada` |

### Push / Cron

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/push/suscribir` | Registra suscripción push `{ endpoint, keys }` |
| `POST` | `/api/push/enviar` | Envía notificación a todos los suscriptores |
| `GET` | `/api/cron/notificaciones` | Ejecutado por QStash — envía notifs para eventos activos según su `intervaloNotificacion` |

---

## Sistema de notificaciones push

### Flujo

```
1. Usuario abre la app
   → PushSubscriber.tsx solicita permiso
   → Registra service worker (/worker/index.ts)
   → Llama POST /api/push/suscribir → guarda en SuscripcionPush

2. QStash ejecuta GET /api/cron/notificaciones cada 5 minutos
   → Busca eventos con estado ACTIVO
   → Para cada evento: compara (ahora - ultimaNotificacion) >= intervaloNotificacion
   → Si corresponde: llama web-push → envía notif a todos los suscriptores
   → Actualiza ultimaNotificacion

3. Service Worker recibe el push
   → Muestra notificación con título del evento
```

### Configuración QStash

- Schedule: `*/5 * * * *` (cada 5 minutos)
- URL destino: `https://kairostimeapp.vercel.app/api/cron/notificaciones`
- El intervalo de recordatorio es **por evento**, configurable en 10 / 15 / 20 / 30 / 45 / 60 minutos

---

## Sistema de diseño

### Tokens de color

```css
--bg:       #000000          /* fondo general */
--card:     #141414          /* tarjetas principales */
--card-2:   #1c1c1c          /* tarjetas secundarias */
--purple:   #c5f135          /* acento lime (botones, progress, checks) */
--border:   rgba(255,255,255,0.08)
--text-1:   #ffffff
--text-2:   rgba(255,255,255,0.55)
--text-3:   rgba(255,255,255,0.28)
--green:    #22c55e
--red:      #ef4444
--yellow:   #f59e0b
```

### Tipografía

- **Fuente:** Inter (Google Fonts, via `next/font/google`)
- **CSS var:** `--font-inter`
- Títulos de sección: Inter Bold 700, 1rem
- Saludo header: Inter Bold 700, 0.7rem, uppercase, letter-spacing 0.08em
- Body: Inter Regular 400–500

### Componentes de diseño clave

| Elemento | Estilo |
|----------|--------|
| Cards principales | `background: #141414`, `border-radius: 20px`, `border: 1px solid rgba(255,255,255,0.06)` |
| Cards completadas | `background: #0d0d0d`, `opacity: 0.5` |
| Botón primario | `background: #c5f135`, `color: #000`, `font-weight: 800`, `border-radius: 14px` |
| Botón cancelar | `background: transparent`, `border: 1px solid rgba(255,255,255,0.1)`, `color: rgba(255,255,255,0.45)` |
| Pills activas | `background: #c5f135`, `color: #000` |
| Pills inactivas | `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.08)` |
| Progress bar | `background: #c5f135`, track `rgba(255,255,255,0.08)`, height 5px |
| Checkbox completado | `background: #c5f135` con SVG check negro |
| Checkbox pendiente | `border: 2px solid rgba(255,255,255,0.2)` |
| Hero card (sesión activa) | `background: #c5f135`, todo el texto en `#000` |

### Prioridades de tareas

| Nivel | Color texto | Background badge |
|-------|------------|------------------|
| ALTA | `#ef4444` | `rgba(239,68,68,0.15)` |
| MEDIA | `#f59e0b` | `rgba(245,158,11,0.12)` |
| BAJA | `rgba(255,255,255,0.3)` | `rgba(255,255,255,0.06)` |

### Inputs / Formularios

```css
background:    #1a1a1a
border:        1px solid rgba(255,255,255,0.1)
border-radius: 12px
padding:       11px 14px
color:         #fff
font-size:     0.9rem
accent-color:  #c5f135   /* para radio buttons y checkboxes nativos */
```

### Navbar

Bottom navigation fija con 3 ítems:
- **Inicio** — ícono casa, activo = círculo `#c5f135` con ícono negro
- **+ Nuevo evento** — cuadrado redondeado `#c5f135` con `+` negro, glow `rgba(197,241,53,0.12)`
- **Proyectos** — ícono grid, mismo comportamiento que Inicio

Altura: `calc(64px + env(safe-area-inset-bottom))`  
Padding contenido: `.has-bottom-nav { padding-bottom: calc(72px + env(safe-area-inset-bottom)) }`

### Headers sticky (páginas interiores)

```css
position: sticky
top: 0
background: rgba(0,0,0,0.9)
backdrop-filter: blur(20px)
border-bottom: 1px solid rgba(255,255,255,0.07)
padding: 14px 20px
```

Contienen: flecha `←` + breadcrumb o título de página

---

## Infraestructura

```
Usuario (móvil)
    │
    ▼
Vercel (Edge)
    │
    ├── Next.js App Router (SSR + API Routes)
    │       │
    │       ├── Neon PostgreSQL (serverless)
    │       │       via Prisma 5
    │       │
    │       └── Upstash QStash
    │               → GET /api/cron/notificaciones cada 5 min
    │
    └── Service Worker (PWA)
            → Recibe Web Push
            → Muestra notificación nativa
```

### Despliegue

El repo es público en GitHub (`dannielmayorg/kairos-app`). El deploy se activa via **deploy hook** de Vercel:

```bash
curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_9QxqulG0Fgn4IqydaTN3us1wzZA9/Zm8bT1ufh9"
```

---

## Variables de entorno

```env
# Base de datos
DATABASE_URL=postgresql://...@neon.tech/kairos

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:...

# QStash (para validar requests del cron)
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
```

---

## Correr localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env.local con las variables de arriba

# 3. Sincronizar schema con la base de datos
npx prisma db push

# 4. Iniciar servidor de desarrollo
npm run dev
```

App disponible en `http://localhost:3000`.

> **Nota:** Las notificaciones push solo funcionan en HTTPS (producción) o localhost con service worker activo.

---

## Flujo completo de uso

```
1. Crear proyecto  →  /nuevo-proyecto
2. Crear evento    →  /nuevo-evento (seleccionar proyecto, fecha, horas, tareas, recordatorio)
3. Dashboard       →  muestra "Próximos eventos" + "Proyectos"
4. Evento llega    →  sincronizarEstados() cambia estado a ACTIVO automáticamente
5. Dashboard       →  Hero card lime "En sesión" aparece
6. Tap "Abrir sesión" →  /eventos/[id]/sesion
7. Dentro de sesión: tap en tareas para completarlas, progreso en tiempo real
8. Notificaciones push cada X minutos mientras el evento está ACTIVO
9. Completar evento →  vuelve al detalle, estado cambia a COMPLETADO
```
