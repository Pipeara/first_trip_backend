# 🚗 FIRST TRIP BACKEND — ROADMAP

## 🎯 Objetivo

Construir el primer vertical slice funcional:

```text
Passenger
   ↓
Community
   ↓
Request Ride
   ↓
Driver
   ↓
Vehicle
   ↓
Accept
   ↓
Start
   ↓
Complete
```

---

# 📅 DÍA 1–5 — FOUNDATION

## 🗄️ DATABASE

✅ PostgreSQL conectado

✅ Base de datos `first_trip`

✅ Schema inicial

✅ Constraints

✅ Enums

✅ Índices

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

**Progress: 100%**

---

# 🚗 DÍA 6 — DRIVERS API

✅ `GET /api/v1/drivers`

✅ `GET /api/v1/drivers/:id`

✅ `POST /api/v1/drivers`

✅ `PATCH /api/v1/drivers/:id/status`

Estados:

```text
OFFLINE
ONLINE
BUSY
```

**Progress: 100%**

---

# 🚘 DÍA 7 — VEHICLES API

✅ `GET /api/v1/vehicles`

✅ `GET /api/v1/vehicles/:id`

✅ `POST /api/v1/vehicles`

✅ `PATCH /api/v1/vehicles/:id/active`

Reglas:

✅ Driver puede tener múltiples vehículos

✅ Vehículo activo asociado al flujo de aceptación

**Progress: 100%**

---

# 🚕 DÍA 8 — RIDES API

✅ `GET /api/v1/rides`

✅ `GET /api/v1/rides/:id`

✅ `POST /api/v1/rides`

### Ride lifecycle

✅ `REQUESTED → SEARCHING`

✅ `SEARCHING → ACCEPTED`

✅ `ACCEPTED → DRIVER_ARRIVING`

✅ `DRIVER_ARRIVING → DRIVER_WAITING`

✅ `DRIVER_WAITING → IN_PROGRESS`

✅ `IN_PROGRESS → COMPLETED`

✅ Cancellation

### Endpoints

```text
PATCH /api/v1/rides/:id/search
PATCH /api/v1/rides/:id/accept
PATCH /api/v1/rides/:id/arriving
PATCH /api/v1/rides/:id/waiting
PATCH /api/v1/rides/:id/start
PATCH /api/v1/rides/:id/complete
PATCH /api/v1/rides/:id/cancel
```

**Progress: 100%**

---

# 📜 RIDE STATUS HISTORY

✅ `ride_status_history`

✅ Historial centralizado

✅ `SEARCHING`

✅ `ACCEPTED`

✅ `DRIVER_ARRIVING`

✅ `DRIVER_WAITING`

✅ `IN_PROGRESS`

✅ `COMPLETED`

✅ `CANCELLED`

**Progress: 100%**

---

# 🔐 DÍA 9 — AUTHENTICATION

## Backend

✅ Register

✅ Login

✅ bcrypt password hashing

✅ JWT

✅ `authenticateToken`

✅ `authorizeRoles`

✅ `PASSENGER`

✅ `DRIVER`

✅ `ADMIN`

✅ `/api/v1/auth/me`

**Backend Progress: 100%**

## Flutter

✅ `ApiConfig`

✅ `ApiClient`

✅ `AuthService`

✅ Login desde Flutter

✅ Recepción de `accessToken`

✅ JWT almacenado en `ApiClient`

✅ `Authorization: Bearer <token>`

✅ `/auth/me` desde Flutter

### Prueba real

```text
Flutter
   ↓
POST /api/v1/auth/login
   ↓
JWT
   ↓
GET /api/v1/auth/me
   ↓
✅ Token válido
```

**Flutter Auth Progress: 100%**

---

# 🗺️ DÍA 10 — MAPS / OSRM

✅ Maps routes

✅ Maps controller

✅ Routing service

✅ `POST /api/v1/maps/route`

✅ Validación de coordenadas

✅ Consulta real a OSRM

✅ Distance

✅ Duration

✅ GeoJSON geometry

✅ Manejo de errores OSRM

### Endpoint

```text
POST /api/v1/maps/route
```

### Response

```text
pickup

destination

route
 ├── distanceMeters
 ├── durationSeconds
 └── geometry
```

### Prueba real

✅ Santiago → Santiago

✅ OSRM respondió correctamente

✅ `LineString` recibido

**Progress: 100%**

---

# 📡 DÍA 11 — WEBSOCKET FOUNDATION

✅ Dependencia `ws`

✅ WebSocket server

✅ Integración con HTTP server

✅ Endpoint:

```text
ws://localhost:3000/ws
```

✅ Connection established

✅ Client → Server

✅ Server → Client

✅ Mensaje de prueba

### Arquitectura

```text
HTTP Server :3000
      │
      ├── Express REST API
      │
      └── WebSocket /ws
```

**Progress: 100%**

---

# 📡 DÍA 12 — WEBSOCKET + RIDES

🟡 **ACTUAL**

### Eventos

```text
ride.join
ride.leave
driver.location_updated
ride.status_changed
```

### Arquitectura objetivo

```text
Passenger
     ↕
 WebSocket
     ↕
 First Trip
     ↕
   Ride
     ↕
  Driver
```

### Implementación

🟡 `websocket.clients.js`

🟡 `websocket.events.js`

🟡 `ride.join`

🟡 `ride.leave`

🟡 Gestión de clientes por viaje

🟡 Validación de usuario autenticado

🟡 Prueba Passenger → Ride

**Progress: 0% → ACTUAL**

### 🎯 Primer objetivo

```text
ride.join
```

---

# 📍 DÍA 13 — DRIVER LOCATION

🟡 Pendiente

### Flujo

```text
Driver GPS
    ↓
driver.location_updated
    ↓
Backend
    ├── driver_locations
    └── WebSocket
             ↓
         Passenger
```

### Objetivos

🟡 Recibir `lat/lng`

🟡 Validar coordenadas

🟡 Guardar ubicación

🟡 Asociar ubicación al driver

🟡 Emitir ubicación al passenger

**Progress: 0%**

---

# 🔄 DÍA 14 — REALTIME RIDE STATUS

🟡 Pendiente

Integrar lifecycle REST + WebSocket:

```text
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

Cada cambio:

```text
ride.status_changed
```

deberá notificarse en tiempo real.

**Progress: 0%**

---

# 🚨 DÍA 15 — INCIDENTS

🟡 Pendiente

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

**Progress: 0%**

---

# 📱 DÍA 16 — FLUTTER / FIRST TRIP INTEGRATION

🟡 En progreso

### REST

✅ `ApiClient`

✅ Backend connectivity

✅ Communities

✅ Authentication

🟡 Maps client → First Trip backend

🟡 Rides client

🟡 Ride creation

🟡 Ride lifecycle

### WebSocket

🟡 Flutter WebSocket client

🟡 `ride.join`

🟡 `driver.location_updated`

🟡 `ride.status_changed`

### Objetivo

Eliminar progresivamente la dependencia de Supabase del flujo principal.

Arquitectura:

```text
                FLUTTER
                   │
       ┌───────────┼───────────┐
       │           │           │
      REST        Maps      WebSocket
       │           │           │
       └───────────┼───────────┘
                   ↓
             FIRST TRIP
                   ↓
             PostgreSQL
```

**Progress: ~30%**

---

# 🧪 DÍA 17 — TESTING

🟡 Pendiente

## API

🟡 Auth

🟡 Drivers

🟡 Vehicles

🟡 Rides

🟡 Maps

## WebSocket

🟡 Connection

🟡 Ride join

🟡 GPS

🟡 Status events

## Database

🟡 Constraints

🟡 Transactions

🟡 Concurrent ride acceptance

**Progress: 0%**

---

# 🔒 DÍA 18 — SECURITY / HARDENING

🟡 Pendiente

🟡 JWT validation

🟡 Role validation

🟡 Input validation

🟡 Rate limiting

🟡 Error handling

🟡 CORS configuration

🟡 Environment variables

🟡 Production configuration

**Progress: 0%**

---

# 🚀 DÍA 19 — PRODUCTION PREPARATION

🟡 Pendiente

🟡 Environment configuration

🟡 Logging

🟡 Health checks

🟡 Database migrations

🟡 Docker

🟡 Deployment preparation

**Progress: 0%**

---

# 🚗 FIRST TRIP — PRIMER VIAJE REAL

## Objetivo inmediato

```text
PASSENGER
    │
    │ Login
    ▼
JWT
    │
    │
    ▼
Community
    │
    │
    ▼
REQUESTED
    │
    ▼
SEARCHING
    │
    ▼
DRIVER
    │
    │ Accept
    ▼
ACCEPTED
    │
    ▼
DRIVER_ARRIVING
    │
    ▼
DRIVER_WAITING
    │
    ▼
IN_PROGRESS
    │
    ▼
COMPLETED
```

### Comunicación realtime

```text
Passenger
     ↕
WebSocket
     ↕
First Trip
     ↕
Driver
```

### Datos involucrados

```text
users
   ↓
communities
   ↓
community_members
   ↓
rides
   ↓
drivers
   ↓
vehicles
   ↓
driver_locations
   ↓
ride_status_history
```

---

# 📊 PROJECT SUMMARY

```text
Día 1–5 — Foundation          100%

Día 6   — Drivers API          100%
Día 7   — Vehicles API         100%
Día 8   — Rides API            100%
Día 9   — Auth                 100%
Día 10  — Maps / OSRM          100%
Día 11  — WebSocket Foundation 100%

Día 12  — WebSocket + Rides      0%  ← ACTUAL
Día 13  — Driver Location        0%
Día 14  — Realtime Status        0%
Día 15  — Incidents              0%
Día 16  — Flutter Integration  ~30%
Día 17  — Testing                0%
Día 18  — Security               0%
Día 19  — Production             0%
```

---

# 🎯 CURRENT TASK

```text
DÍA 12 — WEBSOCKET + RIDES
```

Primer objetivo:

```text
src/websocket/

├── websocket.server.js       ✅
├── websocket.clients.js      🟡
└── websocket.events.js       🟡
```

Implementar:

```text
1. websocket.clients.js
          ↓
2. websocket.events.js
          ↓
3. ride.join
          ↓
4. ride.leave
          ↓
5. Prueba real
          ↓
6. driver.location_updated
```

## 🚗 HITO ACTUAL

```text
Backend REST       ████████████████████ 100%
Auth               ████████████████████ 100%
Maps / OSRM        ████████████████████ 100%
WebSocket base     ████████████████████ 100%

WebSocket Rides    ░░░░░░░░░░░░░░░░░░░░   0%
Driver GPS         ░░░░░░░░░░░░░░░░░░░░   0%
Realtime Status    ░░░░░░░░░░░░░░░░░░░░   0%

                🚗 FIRST TRIP
             PRIMER VIAJE REAL
```

