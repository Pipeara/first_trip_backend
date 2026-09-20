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

# 📅 Roadmap de desarrollo

| Día        | Objetivo principal                     | Estado                 |
| ---------- | -------------------------------------- | ---------------------- |
| **Día 1**  | PostgreSQL + base de datos             | ✅ Completado           |
| **Día 2**  | Schema + tablas + relaciones           | ✅ Completado           |
| **Día 3**  | Node.js + Express + `pg` + conexión DB | ✅ Completado           |
| **Día 4**  | Users API                              | ✅ Completado           |
| **Día 5**  | Communities API                        | ✅ Completado           |
| **Día 6**  | Drivers API                            | ✅ Completado           |
| **Día 7**  | Vehicles API                           | ✅ Completado           |
| **Día 8**  | Rides + estados + aceptación           | 🟡 En progreso         |
| **Día 9**  | Auth + bcrypt + JWT                    | ✅ Completado           |
| **Día 10** | Maps + OSRM                            | 🟡 Estructura iniciada |
| **Día 11** | WebSocket + tiempo real                | ⏳ Pendiente            |
| **Día 12** | Incidentes + Monitor                   | ⏳ Pendiente            |
| **Día 13** | Flutter + Primer Vertical Slice        | ⏳ Pendiente            |

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
* [x] Verificar estructura de `drivers`
* [x] Verificar estructura de `vehicles`
* [x] Verificar estructura de `rides`
* [x] Verificar estructura de `ride_status_history`

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
* [x] Crear estructura `services/`

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
services
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
* [x] `GET /api/v1/users`
* [x] Consultar usuarios desde PostgreSQL
* [x] Probar API → PostgreSQL
* [x] Crear datos de prueba
* [x] Verificar usuario Passenger
* [x] Verificar usuario Driver

---

# 🟢 DÍA 5 — Communities API

## Communities API

* [x] Crear `communities.controller.js`
* [x] Crear `communities.routes.js`
* [x] `GET /api/v1/communities`
* [x] Consultar comunidades desde PostgreSQL
* [x] Probar endpoint con `curl`
* [x] Probar endpoint con Postman
* [x] Verificar comunidad Alto San Carlos

### Endpoint

```http
GET /api/v1/communities
```

---

# 🟢 DÍA 6 — Drivers API

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
* [x] `PATCH /api/v1/drivers/:id/status`
* [x] Validar `OFFLINE`
* [x] Validar `ONLINE`
* [x] Validar `BUSY`
* [x] Validar conductor inexistente
* [x] Validar estado inválido
* [x] Probar con `curl`
* [x] Probar con Postman
* [x] Verificar datos en PostgreSQL

### Estados

```text
OFFLINE
ONLINE
BUSY
```

### Flujo

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

# 🟢 DÍA 7 — Vehicles API

## Vehicles API

* [x] Crear `vehicles.controller.js`
* [x] Crear `vehicles.routes.js`
* [x] `GET /api/v1/vehicles`
* [x] `GET /api/v1/vehicles/:id`
* [x] `POST /api/v1/vehicles`
* [x] Actualizar `active`
* [x] Validar `driver_id`
* [x] Validar conductor existente
* [x] Validar placa única
* [x] Validar año
* [x] Validar `active`
* [x] Probar relación Driver → Vehicle
* [x] Probar con `curl`
* [x] Probar con Postman
* [x] Verificar estructura e índices PostgreSQL

## Modelo Driver → Vehicle

Un conductor puede tener **varios vehículos**.

```text
Driver
   │
   ├── Vehicle A
   │
   ├── Vehicle B
   │
   └── Vehicle C
```

`driver_id` **NO es UNIQUE**.

### Estado actual

```text
Driver
   │
   ├── Hyundai Accent → active = false
   │
   └── Toyota Corolla → active = true
```

### Regla de negocio pendiente

* [ ] Garantizar que un conductor tenga como máximo un vehículo `active = true`
* [ ] Definir actualización transaccional del vehículo activo
* [ ] Utilizar vehículo activo durante `Accept Ride`

> Esta regla debe quedar consolidada antes de implementar la aceptación de viajes.

---

# 🟡 DÍA 8 — Rides + Estados

## Rides API

### Implementado

* [x] `GET /api/v1/rides`
* [x] `GET /api/v1/rides/:id`
* [x] `POST /api/v1/rides`
* [x] Autenticación JWT para crear ride
* [x] Derivar `passenger_id` desde `req.user.userId`
* [x] Validar usuario
* [x] Validar rol `PASSENGER`
* [x] Validar usuario `ACTIVE`
* [x] Validar Community existente
* [x] Validar Community activa
* [x] Validar membership `ACTIVE`
* [x] Crear ride desde API
* [x] Verificar ride en PostgreSQL
* [x] Estado inicial `REQUESTED`

### Endpoint actual

```http
POST /api/v1/rides
Authorization: Bearer TOKEN
```

### Flujo actual

```text
Passenger
    ↓
JWT
    ↓
req.user.userId
    ↓
Validar Passenger
    ↓
Validar Community
    ↓
Validar Membership
    ↓
Crear Ride
    ↓
REQUESTED
```

---

## Pendiente

### Búsqueda y asignación

* [ ] Buscar conductores
* [ ] Implementar `REQUESTED → SEARCHING`
* [ ] Definir disponibilidad de conductores
* [ ] `PATCH /api/v1/rides/:id/accept`

### Accept Ride

* [ ] Validar JWT
* [ ] Validar rol `DRIVER`
* [ ] Validar usuario `ACTIVE`
* [ ] Buscar Driver asociado al usuario autenticado
* [ ] Validar `approval_status = APPROVED`
* [ ] Validar `status = ONLINE`
* [ ] Buscar vehículo activo
* [ ] Validar que el vehículo pertenezca al Driver
* [ ] Asociar `driver_id`
* [ ] Asociar `vehicle_id`
* [ ] Cambiar estado a `ACCEPTED`
* [ ] Registrar `accepted_at`
* [ ] Registrar `updated_at`
* [ ] Crear registro en `ride_status_history`
* [ ] Usar `changed_by = req.user.userId`

### Concurrencia

* [ ] Usar PostgreSQL transaction
* [ ] Usar `SELECT ... FOR UPDATE`
* [ ] Impedir que dos conductores acepten el mismo viaje
* [ ] Hacer `COMMIT` después de completar todas las operaciones
* [ ] Hacer `ROLLBACK` ante cualquier error

### Estados posteriores

* [ ] `ACCEPTED → DRIVER_ARRIVING`
* [ ] `DRIVER_ARRIVING → DRIVER_WAITING`
* [ ] `DRIVER_WAITING → IN_PROGRESS`
* [ ] `IN_PROGRESS → COMPLETED`
* [ ] Implementar `CANCELLED`
* [ ] Validar todas las transiciones

### Base de datos

* [ ] Agregar al enum `ride_status` los estados faltantes:

  * [ ] `IN_PROGRESS`
  * [ ] `COMPLETED`
  * [ ] `CANCELLED`
* [ ] Crear/usar correctamente `ride_status_history`
* [ ] Endpoint para consultar historial
* [ ] Probar flujo completo

### Estados objetivo

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

# 🟢 DÍA 9 — Authentication

## Registro

* [x] Crear `auth.controller.js`
* [x] Crear `auth.routes.js`
* [x] `POST /api/v1/auth/register`
* [x] Instalar `bcrypt`
* [x] Hash de contraseñas
* [x] Guardar `password_hash`
* [x] Validar campos obligatorios
* [x] Validar RUT
* [x] Validar email
* [x] Validar usuario duplicado
* [x] Probar registro exitoso
* [x] Probar registro duplicado
* [x] Probar password faltante

## Login

* [x] `POST /api/v1/auth/login`
* [x] Buscar usuario
* [x] `bcrypt.compare()`
* [x] Generar JWT
* [x] Devolver token
* [x] Probar login exitoso
* [x] Probar credenciales inválidas

## JWT

* [x] Instalar `jsonwebtoken`
* [x] Configurar `JWT_SECRET`
* [x] Crear middleware de autenticación
* [x] Leer `Authorization: Bearer TOKEN`
* [x] Validar token
* [x] Crear `req.user`
* [x] Validar token inválido
* [x] Validar token ausente
* [x] Validar token expirado

## Usuario autenticado

* [x] Endpoint protegido `/api/v1/auth/me`
* [x] Verificar usuario autenticado

## Roles

* [x] Middleware `authorizeRoles`
* [x] `PASSENGER`
* [x] `DRIVER`
* [x] `ADMIN`
* [x] Probar acceso permitido
* [x] Probar acceso prohibido

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
Middleware
   ↓
req.user
```

---

# 🟡 DÍA 10 — Maps + OSRM

## Routing

### Estructura creada

* [x] Crear `maps.routes.js`
* [x] Crear `maps.controller.js`
* [x] Crear `routing.service.js`

### Pendiente

* [ ] Configurar integración OSRM
* [ ] Crear `POST /api/v1/maps/route`
* [ ] Validar coordenadas
* [ ] Consultar OSRM
* [ ] Obtener distancia
* [ ] Obtener duración
* [ ] Obtener geometría
* [ ] Manejar errores de routing
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
maps.controller
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
* [ ] Validar coordenadas
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

### Decisión técnica

First Trip utilizará inicialmente **WebSocket nativo**.

Socket.IO queda como alternativa futura si necesitamos:

```text
rooms
reconnection
event abstraction
fallback transports
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

El flujo completo objetivo es:

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
SEARCHING
    ↓
Driver ONLINE
    ↓
Driver receives ride
    ↓
Accept
    ↓
Vehicle associated
    ↓
ACCEPTED
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

---

# 🔐 DECISIONES TÉCNICAS

First Trip utiliza:

```text
Node.js
Express
PostgreSQL
pg
bcrypt
JWT
WebSocket
OSRM
Flutter
OpenStreetMap
```

First Trip **NO utiliza**:

```text
Supabase
Prisma
Google Maps
MySQL
```

---

# 📁 ESTRUCTURA ACTUAL

```text
first_trip_backend/
│
├── docs/
│   └── ROADMAP.md
│
├── scripts/
│   ├── schema.sql
│   ├── test-db.js
│   └── project-status.js
│
├── src/
│   ├── config/
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── communities.controller.js
│   │   ├── drivers.controller.js
│   │   ├── maps.controller.js
│   │   ├── rides.controller.js
│   │   ├── users.controller.js
│   │   └── vehicles.controller.js
│   │
│   ├── middleware/
│   │   └── auth.middleware.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── communities.routes.js
│   │   ├── drivers.routes.js
│   │   ├── maps.routes.js
│   │   ├── rides.routes.js
│   │   ├── users.routes.js
│   │   └── vehicles.routes.js
│   │
│   ├── services/
│   │   └── routing.service.js
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

---

# 📊 ESTADO GENERAL ACTUAL

```text
Día 1   ████████████████████ 100%
Día 2   ████████████████████ 100%
Día 3   ████████████████████ 100%
Día 4   ████████████████████ 100%
Día 5   ████████████████████ 100%
Día 6   ████████████████████ 100%
Día 7   ████████████████████ 100%
Día 8   █████████████████░░░ ~85%
Día 9   ████████████████████ 100%
Día 10  ██████░░░░░░░░░░░░░░ ~30%
Día 11  ░░░░░░░░░░░░░░░░░░░░   0%
Día 12  ░░░░░░░░░░░░░░░░░░░░   0%
Día 13  ░░░░░░░░░░░░░░░░░░░░   0%
```

---

# 🎯 CURRENT TASK

```text
DÍA 8 — ACCEPT RIDE
        ↓
Consolidar vehículo activo
        ↓
REQUESTED → SEARCHING
        ↓
PATCH /api/v1/rides/:id/accept
        ↓
Validar JWT
        ↓
Validar DRIVER
        ↓
Validar APPROVED
        ↓
Validar ONLINE
        ↓
Buscar vehículo activo
        ↓
SELECT ... FOR UPDATE
        ↓
PostgreSQL transaction
        ↓
Asignar Driver + Vehicle
        ↓
ACCEPTED
        ↓
ride_status_history
```

### Antes de implementar Accept Ride

Debemos resolver:

```text
1. Un conductor puede tener varios vehículos.
2. Solo uno debería estar activo.
3. Accept Ride utilizará el vehículo activo.
4. La aceptación debe ser transaccional.
5. Dos conductores no pueden aceptar el mismo ride.
6. El ride debe estar en SEARCHING.
```

---

# 🚦 ESTADO DEL PROYECTO

```text
Database
    ↓
ONLINE

PostgreSQL
    ↓
CONNECTED

Node.js
    ↓
RUNNING

Express
    ↓
RUNNING

Authentication
    ↓
WORKING

Drivers API
    ↓
WORKING

Vehicles API
    ↓
WORKING

Rides API
    ↓
WORKING

Accept Ride
    ↓
NEXT

WebSocket
    ↓
PENDING

Flutter
    ↓
PENDING
```

---

# 🚀 PRÓXIMO BLOQUE

```text
VEHICLES
   ↓
Regla vehículo activo
   ↓
RIDES
   ↓
REQUESTED → SEARCHING
   ↓
ACCEPT RIDE
   ↓
TRANSACTION
   ↓
DRIVER + VEHICLE
   ↓
ACCEPTED
```

> El objetivo inmediato no es agregar más endpoints indiscriminadamente. Es completar correctamente el flujo de negocio de un viaje, desde `REQUESTED` hasta `ACCEPTED`, antes de avanzar a tiempo real y Flutter.
