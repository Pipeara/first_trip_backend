# First Trip Backend — Roadmap

## 🟢 Completado

### Base de datos
- [x] PostgreSQL instalado
- [x] Crear base de datos `first_trip`
- [x] Crear `schema.sql`
- [x] Crear 9 tablas
- [x] Crear relaciones
- [x] Crear constraints
- [x] Crear índices
- [x] Agregar RUT
- [x] Verificar estructura de tablas

### Datos de prueba
- [x] Crear usuario Passenger
- [x] Crear comunidad Alto San Carlos
- [x] Crear membership Passenger → Community
- [x] Crear usuario Driver Test

### Backend
- [x] Node.js
- [x] Express
- [x] pg
- [x] dotenv
- [x] Configuración `.env`
- [x] Pool PostgreSQL
- [x] Probar conexión Node → PostgreSQL
- [x] Crear `/health`
- [x] Crear `GET /api/v1/rides`
- [x] Probar API → PostgreSQL

---

# 🟡 AHORA

## Drivers y vehículos

- [x] Crear `drivers` para Driver Test
- [x] Crear vehículo
- [x] Verificar relación Driver → Vehicle
- [x] Crear primer ride manualmente
- [x] Verificar relaciones del ride

---

# 🔵 DESPUÉS

## API REST

- [ ] Users API
- [ ] Communities API
- [ ] Drivers API
- [ ] Vehicles API
- [ ] Rides API completa

## Autenticación

- [ ] Auth register
- [ ] Instalar bcrypt
- [ ] Hash de contraseñas
- [ ] Login
- [ ] JWT
- [ ] `/api/v1/users/me`
- [ ] Middleware de autenticación
- [ ] Middleware de roles
- [ ] Membership validation

## Viajes

- [ ] Crear ride desde API
- [ ] Buscar conductores
- [ ] Accept ride
- [ ] PostgreSQL transaction
- [ ] Start ride
- [ ] Complete ride
- [ ] Cancel ride
- [ ] Status history

## Mapas

- [ ] Configurar OSRM
- [ ] Crear `routing.service.js`
- [ ] Crear `/api/v1/maps/route`
- [ ] Probar routing con Postman

## Tiempo real

- [ ] WebSocket
- [ ] Autenticación WebSocket
- [ ] `ride.join`
- [ ] Driver location
- [ ] `driver.location_updated`
- [ ] Ride status events
- [ ] GPS en tiempo real

## Incidentes

- [ ] Crear incidentes
- [ ] Consultar incidentes
- [ ] Cambiar estado de incidente
- [ ] Relacionar incidente con ride
- [ ] Relacionar incidente con driver
- [ ] Relacionar incidente con vehicle

## Monitor

- [ ] Monitor central
- [ ] Mapa de vehículos activos
- [ ] Viajes activos
- [ ] Conductores online
- [ ] Estados de viajes
- [ ] Incidentes

## Flutter

- [ ] Conectar Flutter con API
- [ ] Login
- [ ] Registro
- [ ] Comunidades
- [ ] Mapa
- [ ] Solicitar viaje
- [ ] Aceptación
- [ ] Seguimiento del conductor
- [ ] Estados del viaje
- [ ] Historial

---

# 🎯 Primer Vertical Slice

El primer flujo completo de First Trip será:

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

---

# 🏗️ Arquitectura

Flutter / React / Postman
↓
REST API + WebSocket
↓
Node.js + Express
├── Routes
├── Controllers
├── Services
├── JWT
└── pg
↓
PostgreSQL


# 📁 Estructura objetivo

first_trip_backend/
├── docs/
│   └── ROADMAP.md
├── scripts/
│   ├── schema.sql
│   └── test-db.js
├── src/
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── .gitignore
├── package.json
└── package-lock.json