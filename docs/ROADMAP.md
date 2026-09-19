# First Trip Backend — Roadmap

> Roadmap de desarrollo del backend de First Trip.
>
> **Objetivo:** construir un backend funcional para el primer vertical slice:
>
> `Passenger → Community → Request Ride → Driver → Vehicle → Accept → Start → Complete`
>
> **Stack:** Node.js + Express + PostgreSQL + `pg` + JWT + WebSocket + OSRM.
>
> **Decisión técnica:** First Trip utiliza PostgreSQL directamente mediante `pg`.
> **No utiliza Supabase ni Prisma.**

---

# 📅 Roadmap de 13 días

| Día        | Objetivo principal                     | Estado         |
| ---------- | -------------------------------------- | -------------- |
| **Día 1**  | PostgreSQL + base de datos             | ✅ Completado   |
| **Día 2**  | Schema + tablas + relaciones           | ✅ Completado   |
| **Día 3**  | Node.js + Express + `pg` + conexión DB | ✅ Completado   |
| **Día 4**  | Users API                              | ✅ Completado   |
| **Día 5**  | Communities API                        | ✅ Completado   |
| **Día 6**  | Drivers API                            | 🟡 En progreso |
| **Día 7**  | Vehicles API                           | ⏳ Siguiente    |
| **Día 8**  | Rides completo + estados               | ⏳              |
| **Día 9**  | Auth + bcrypt + JWT                    | ⏳              |
| **Día 10** | Routing / OSRM                         | ⏳              |
| **Día 11** | WebSocket + tiempo real                | ⏳              |
| **Día 12** | Incidentes + Monitor                   | ⏳              |
| **Día 13** | Flutter + Primer Vertical Slice        | ⏳              |

---

# 🟢 DÍA 1 — PostgreSQL + Base de Datos

## Base de datos

* [x] PostgreSQL instalado
* [x] Crear base de datos `first_trip`
* [x] Conectarse mediante `psql`
* [x] Verificar `current_database()`

---

# 🟢 DÍA 2 — Schema + Relaciones

## Base de datos

* [x] Crear `schema.sql`
* [x] Crear 9 tablas
* [x] Crear ENUMs
* [x] Crear Primary Keys
* [x] Crear Foreign Keys
* [x] Crear relaciones
* [x] Crear constraints
* [x] Crear índices
* [x] Agregar RUT
* [x] Verificar estructura de tablas
* [x] Verificar relaciones entre tablas

### Tablas

```text
users
communities
community_members
drivers
vehicles
rides
driver_locations
ride_status_history
incidents
```

---

# 🟢 DÍA 3 — Node.js + Express + PostgreSQL

## Backend

* [x] Node.js
* [x] Express
* [x] `pg`
* [x] dotenv
* [x] Configuración `.env`
* [x] Crear Pool PostgreSQL
* [x] Probar conexión Node → PostgreSQL
* [x] Crear `server.js`
* [x] Crear `app.js`
* [x] Crear `/health`
* [x] Crear estructura `routes/`
* [x] Crear estructura `controllers/`

### Arquitectura actual

```text
server.js
    ↓
app.js
    ↓
routes
    ↓
controllers
    ↓
pg Pool
    ↓
PostgreSQL
```

---

# 🟢 DÍA 4 — Users API

## Users API

* [x] Crear Users controller
* [x] Crear Users routes
* [x] Crear `GET /api/v1/users`
* [x] Consultar usuarios desde PostgreSQL
* [x] Probar API → PostgreSQL
* [x] Crear datos de prueba
* [x] Verificar usuario Passenger
* [x] Verificar usuario Driver

### Próximamente en Auth

Las operaciones relacionadas con contraseñas, login y JWT se trasladan al bloque de autenticación.

---

# 🟢 DÍA 5 — Communities API

## Communities API

* [x] Crear `communities.controller.js`
* [x] Crear `communities.routes.js`
* [x] Crear `GET /api/v1/communities`
* [x] Consultar comunidades desde PostgreSQL
* [x] Probar endpoint con `curl`
* [x] Probar endpoint con Postman
* [x] Verificar comunidad Alto San Carlos

### Endpoint actual

```http
GET /api/v1/communities
```

---

# 🟡 DÍA 6 — Drivers API

## Drivers API

### Implementado

* [x] Crear `drivers.controller.js`
* [x] Crear `drivers.routes.js`
* [x] `GET /api/v1/drivers`
* [x] `GET /api/v1/drivers/:id`
* [x] `POST /api/v1/drivers`
* [x] Validar que exista el usuario
* [x] Validar que el usuario tenga rol `DRIVER`
* [x] Evitar duplicar un conductor
* [x] Crear Driver Test
* [x] Crear Driver Test 2
* [x] Probar respuestas HTTP
* [x] Verificar datos en PostgreSQL

### Pendiente

* [ ] `PATCH /api/v1/drivers/:id/status`
* [ ] Validar estados `OFFLINE`
* [ ] Validar estados `ONLINE`
* [ ] Validar estados `BUSY`
* [ ] Probar cambio `OFFLINE → ONLINE`
* [ ] Probar cambio `ONLINE → BUSY`
* [ ] Probar cambio `BUSY → OFFLINE`
* [ ] Validar conductor inexistente
* [ ] Validar estado inválido
* [ ] Probar con `curl`
* [ ] Probar con Postman
* [ ] Commit y push

### Estados

```text
OFFLINE
ONLINE
BUSY
```

### Objetivo del día

```text
Driver
   ↓
OFFLINE
   ↓
ONLINE
   ↓
BUSY
```

---

# ⏳ DÍA 7 — Vehicles API

## Vehicles API

* [ ] Crear `vehicles.controller.js`
* [ ] Crear `vehicles.routes.js`
* [ ] Crear `GET /api/v1/vehicles`
* [ ] Crear `GET /api/v1/vehicles/:id`
* [ ] Crear `POST /api/v1/vehicles`
* [ ] Crear `PATCH /api/v1/vehicles/:id`
* [ ] Validar `driver_id`
* [ ] Validar conductor existente
* [ ] Validar placa única
* [ ] Validar año
* [ ] Validar `active`
* [ ] Probar relación Driver → Vehicle
* [ ] Probar con `curl`
* [ ] Probar con Postman
* [ ] Commit y push

### Relación

```text
Driver
   │
   └── Vehicle
         ├── brand
         ├── model
         ├── year
         ├── plate
         ├── color
         └── active
```

---

# ⏳ DÍA 8 — Rides completo + estados

## Rides API

### Ya implementado

* [x] `GET /api/v1/rides`
* [x] `POST /api/v1/rides`
* [x] Crear ride desde API
* [x] Verificar ride en PostgreSQL

### Pendiente

* [ ] `GET /api/v1/rides/:id`
* [ ] Validar Passenger
* [ ] Validar Community
* [ ] Validar membership
* [ ] Buscar conductores
* [ ] `SEARCHING`
* [ ] Accept ride
* [ ] Asociar Driver
* [ ] Asociar Vehicle
* [ ] PostgreSQL transaction
* [ ] Start ride
* [ ] Complete ride
* [ ] Cancel ride
* [ ] Validar transiciones de estado
* [ ] Crear `ride_status_history`
* [ ] Consultar historial
* [ ] Probar flujo completo

### Estados

```text
REQUESTED
    ↓
SEARCHING
    ↓
ACCEPTED
    ↓
DRIVER_ARRIVING
    ↓
DRIVER_WAITING
    ↓
IN_PROGRESS
    ↓
COMPLETED
```

Cancelación:

```text
REQUESTED
    ↓
CANCELLED
```

---

# ⏳ DÍA 9 — Authentication

## Registro

* [ ] Crear `auth.controller.js`
* [ ] Crear `auth.routes.js`
* [ ] `POST /api/v1/auth/register`
* [ ] Instalar `bcrypt`
* [ ] Hash de contraseñas
* [ ] Guardar `password_hash`
* [ ] Validar email
* [ ] Validar RUT
* [ ] Validar usuario duplicado

## Login

* [ ] `POST /api/v1/auth/login`
* [ ] Buscar usuario
* [ ] `bcrypt.compare()`
* [ ] Generar JWT
* [ ] Devolver token

## JWT

* [ ] Instalar `jsonwebtoken`
* [ ] Crear JWT secret
* [ ] Crear middleware de autenticación
* [ ] Leer `Authorization: Bearer TOKEN`
* [ ] Validar token
* [ ] Crear `req.user`

## Usuario autenticado

* [ ] `GET /api/v1/users/me`

## Roles

* [ ] Middleware de roles
* [ ] `PASSENGER`
* [ ] `DRIVER`
* [ ] `ADMIN`

## Communities

* [ ] Membership validation
* [ ] Validar que Passenger pertenezca a Community

### Flujo

```text
Register
   ↓
bcrypt
   ↓
PostgreSQL
   ↓
Login
   ↓
JWT
   ↓
Authorization
   ↓
req.user
```

---

# ⏳ DÍA 10 — Maps + OSRM

## Routing

* [ ] Configurar OSRM
* [ ] Crear `maps.routes.js`
* [ ] Crear `maps.controller.js`
* [ ] Crear `routing.service.js`
* [ ] Crear `POST /api/v1/maps/route`
* [ ] Enviar coordenadas
* [ ] Consultar OSRM
* [ ] Obtener distancia
* [ ] Obtener duración
* [ ] Obtener geometría
* [ ] Probar con Postman
* [ ] Integrar routing con rides

### Flujo

```text
Passenger
    ↓
Pickup + Destination
    ↓
Maps API
    ↓
routing.service
    ↓
OSRM
    ↓
Distance + Duration + Geometry
```

---

# ⏳ DÍA 11 — WebSocket + Tiempo Real

## WebSocket

* [ ] Crear servidor WebSocket
* [ ] Integrarlo con Node/Express
* [ ] Autenticación WebSocket
* [ ] Identificar usuario conectado
* [ ] Crear `ride.join`
* [ ] Driver location
* [ ] `driver.location_updated`
* [ ] Ride status events
* [ ] Manejar desconexión
* [ ] Asociar WebSocket con ride

## GPS

* [ ] Recibir latitud
* [ ] Recibir longitud
* [ ] Guardar ubicación
* [ ] Crear registros en `driver_locations`
* [ ] Emitir actualización al Passenger
* [ ] Probar movimiento simulado

### Flujo

```text
Driver
   ↓
GPS
   ↓
WebSocket
   ↓
Node.js
   ↓
driver_locations
   ↓
Passenger
```

---

# ⏳ DÍA 12 — Incidentes + Monitor

## Incidentes

* [ ] Crear `incidents.controller.js`
* [ ] Crear `incidents.routes.js`
* [ ] Crear incidente
* [ ] Consultar incidentes
* [ ] Consultar incidente por ID
* [ ] Cambiar estado de incidente
* [ ] Relacionar incidente con ride
* [ ] Relacionar incidente con driver
* [ ] Relacionar incidente con vehicle
* [ ] Relacionar incidente con usuario
* [ ] Probar incidentes

### Tipos

```text
THEFT
ACCIDENT
EMERGENCY
DRIVER_ALERT
PASSENGER_ALERT
OTHER
```

### Estados

```text
OPEN
INVESTIGATING
RESOLVED
CLOSED
```

---

## Monitor

* [ ] Monitor central
* [ ] Mapa de vehículos activos
* [ ] Viajes activos
* [ ] Conductores online
* [ ] Estados de viajes
* [ ] Incidentes abiertos
* [ ] Ubicación de conductores
* [ ] Endpoint para dashboard

### Conceptualmente

```text
                  MONITOR
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Drivers         Rides       Incidents
   ONLINE          ACTIVE         OPEN
       │             │             │
       └─────────────┼─────────────┘
                     ↓
                 Dashboard
```

---

# ⏳ DÍA 13 — Flutter + Primer Vertical Slice

## Flutter

* [ ] Conectar Flutter con API
* [ ] Configurar cliente HTTP
* [ ] Login
* [ ] Registro
* [ ] Guardar JWT
* [ ] Comunidades
* [ ] Mapa
* [ ] Solicitar viaje
* [ ] Mostrar estado del viaje
* [ ] Aceptación
* [ ] Seguimiento del conductor
* [ ] Estados del viaje
* [ ] Historial

## Passenger

* [ ] Login
* [ ] Seleccionar Community
* [ ] Seleccionar pickup
* [ ] Seleccionar destination
* [ ] Solicitar ride
* [ ] Esperar conductor
* [ ] Ver conductor
* [ ] Ver ubicación
* [ ] Ver estado
* [ ] Finalizar viaje
* [ ] Ver historial

## Driver

* [ ] Login
* [ ] Cambiar a ONLINE
* [ ] Recibir ride
* [ ] Ver pickup
* [ ] Accept
* [ ] DRIVER_ARRIVING
* [ ] DRIVER_WAITING
* [ ] Start
* [ ] IN_PROGRESS
* [ ] Complete

---

# 🎯 PRIMER VERTICAL SLICE

El primer flujo completo que debe funcionar es:

```text
Passenger
    ↓
Login
    ↓
Community
    ↓
Request Ride
    ↓
Ride REQUESTED
    ↓
Driver ONLINE
    ↓
Driver receives ride
    ↓
Accept
    ↓
Vehicle associated
    ↓
DRIVER_ARRIVING
    ↓
DRIVER_WAITING
    ↓
Start
    ↓
IN_PROGRESS
    ↓
Complete
    ↓
COMPLETED
```

---

# 🏗️ ARQUITECTURA

```text
┌─────────────────────────────┐
│       Flutter / React       │
│          Postman            │
└──────────────┬──────────────┘
               │
               │ HTTP / WebSocket
               ↓
┌─────────────────────────────┐
│       Node.js + Express     │
├─────────────────────────────┤
│ Routes                      │
│ Controllers                 │
│ Services                    │
│ Middleware                  │
│ JWT                         │
│ WebSocket                   │
│ pg                          │
└──────────────┬──────────────┘
               │
               ↓
┌─────────────────────────────┐
│         PostgreSQL          │
├─────────────────────────────┤
│ users                       │
│ communities                 │
│ community_members           │
│ drivers                     │
│ vehicles                    │
│ rides                       │
│ driver_locations            │
│ ride_status_history         │
│ incidents                   │
└─────────────────────────────┘
```

## Decisión técnica

First Trip utiliza:

```text
Node.js
Express
PostgreSQL
pg
JWT
WebSocket
OSRM
Flutter
```

First Trip **NO utiliza**:

```text
Supabase
Prisma
```

---

# 📁 ESTRUCTURA ACTUAL

```text
first_trip_backend/
├── package.json
├── package-lock.json
├── .env
├── .env.example
├── .gitignore
│
└── src/
    ├── server.js
    ├── app.js
    │
    ├── config/
    │   └── db.js
    │
    ├── routes/
    │   ├── auth.routes.js
    │   ├── maps.routes.js
    │   ├── rides.routes.js
    │   ├── users.routes.js
    │   ├── communities.routes.js
    │   └── drivers.routes.js
    │
    └── controllers/
        ├── auth.controller.js
        ├── maps.controller.js
        ├── rides.controller.js
        ├── users.controller.js
        ├── communities.controller.js
        └── drivers.controller.js
```

---

# 📁 ESTRUCTURA OBJETIVO

```text
first_trip_backend/
│
├── docs/
│   └── ROADMAP.md
│
├── scripts/
│   ├── schema.sql
│   └── test-db.js
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── users.routes.js
│   │   ├── communities.routes.js
│   │   ├── drivers.routes.js
│   │   ├── vehicles.routes.js
│   │   ├── rides.routes.js
│   │   ├── maps.routes.js
│   │   └── incidents.routes.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── users.controller.js
│   │   ├── communities.controller.js
│   │   ├── drivers.controller.js
│   │   ├── vehicles.controller.js
│   │   ├── rides.controller.js
│   │   ├── maps.controller.js
│   │   └── incidents.controller.js
│   │
│   ├── services/
│   │   ├── routing.service.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── role.middleware.js
│   │
│   ├── websocket/
│   │   └── ...
│   │
│   ├── app.js
│   └── server.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json
```

> `services/`, `middleware/` y `websocket/` se incorporarán cuando realmente sean necesarios. No se crearán carpetas vacías solamente para cumplir una estructura.

---

# 📊 ESTADO GENERAL ACTUAL

```text
Día 1   ████████████████████ 100%
Día 2   ████████████████████ 100%
Día 3   ████████████████████ 100%
Día 4   ████████████████████ 100%
Día 5   ████████████████████ 100%
Día 6   ███████████████░░░░░  ~75%
Día 7   ░░░░░░░░░░░░░░░░░░░░   0%
Día 8   ░░░░░░░░░░░░░░░░░░░░   0%
Día 9   ░░░░░░░░░░░░░░░░░░░░   0%
Día 10  ░░░░░░░░░░░░░░░░░░░░   0%
Día 11  ░░░░░░░░░░░░░░░░░░░░   0%
Día 12  ░░░░░░░░░░░░░░░░░░░░   0%
Día 13  ░░░░░░░░░░░░░░░░░░░░   0%
```

**Próxima tarea concreta:**

```text
DÍA 6
   ↓
PATCH /api/v1/drivers/:id/status
   ↓
OFFLINE → ONLINE
   ↓
probar con curl
   ↓
probar con Postman
   ↓
cerrar Día 6
   ↓
DÍA 7 — Vehicles API
```

---
