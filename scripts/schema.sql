CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- ENUMS
-- =========================================================

CREATE TYPE user_role AS ENUM (
    'PASSENGER',
    'DRIVER',
    'ADMIN'
);

CREATE TYPE user_status AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'BLOCKED'
);

CREATE TYPE membership_status AS ENUM (
    'ACTIVE',
    'INACTIVE'
);

CREATE TYPE driver_approval_status AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);

CREATE TYPE driver_status AS ENUM (
    'OFFLINE',
    'ONLINE',
    'BUSY'
);

CREATE TYPE ride_status AS ENUM (
    'REQUESTED',
    'SEARCHING',
    'ACCEPTED',
    'DRIVER_ARRIVING',
    'DRIVER_WAITING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE incident_status AS ENUM (
    'OPEN',
    'INVESTIGATING',
    'RESOLVED',
    'CLOSED'
);

CREATE TYPE incident_type AS ENUM (
    'THEFT',
    'ACCIDENT',
    'EMERGENCY',
    'DRIVER_ALERT',
    'PASSENGER_ALERT',
    'OTHER'
);

-- =========================================================
-- USERS
-- =========================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(120) NOT NULL,

    -- RUT chileno normalizado.
    -- Ejemplo: 12345678-5
    rut VARCHAR(12) NOT NULL UNIQUE,

    email VARCHAR(255) NOT NULL UNIQUE,

    phone VARCHAR(30),

    password_hash TEXT NOT NULL,

    role user_role NOT NULL DEFAULT 'PASSENGER',

    status user_status NOT NULL DEFAULT 'ACTIVE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_users_rut_format
        CHECK (
            rut ~ '^[0-9]{7,8}-[0-9Kk]$'
        )
);

-- =========================================================
-- COMMUNITIES
-- =========================================================

CREATE TABLE communities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name VARCHAR(150) NOT NULL,

    address TEXT,

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- COMMUNITY MEMBERS
-- =========================================================

CREATE TABLE community_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    community_id UUID NOT NULL,

    user_id UUID NOT NULL,

    membership_status membership_status NOT NULL DEFAULT 'ACTIVE',

    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_community_members_community
        FOREIGN KEY (community_id)
        REFERENCES communities(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_community_members_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_community_member
        UNIQUE (community_id, user_id)
);

-- =========================================================
-- DRIVERS
-- =========================================================

CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE,

    approval_status driver_approval_status NOT NULL DEFAULT 'PENDING',

    status driver_status NOT NULL DEFAULT 'OFFLINE',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_drivers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- =========================================================
-- VEHICLES
-- =========================================================

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    driver_id UUID NOT NULL,

    brand VARCHAR(80) NOT NULL,

    model VARCHAR(80) NOT NULL,

    year SMALLINT,

    plate VARCHAR(20) NOT NULL UNIQUE,

    color VARCHAR(40),

    active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_vehicles_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_vehicle_driver
        UNIQUE (id, driver_id),

    CONSTRAINT chk_vehicle_year
        CHECK (
            year IS NULL
            OR year BETWEEN 1900 AND 2100
        )
);

-- =========================================================
-- RIDES
-- =========================================================

CREATE TABLE rides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    passenger_id UUID NOT NULL,

    driver_id UUID,

    vehicle_id UUID,

    community_id UUID NOT NULL,

    pickup_lat DOUBLE PRECISION NOT NULL,

    pickup_lng DOUBLE PRECISION NOT NULL,

    pickup_address TEXT,

    destination_lat DOUBLE PRECISION NOT NULL,

    destination_lng DOUBLE PRECISION NOT NULL,

    destination_address TEXT,

    status ride_status NOT NULL DEFAULT 'REQUESTED',

    scheduled_at TIMESTAMPTZ,

    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    accepted_at TIMESTAMPTZ,

    started_at TIMESTAMPTZ,

    completed_at TIMESTAMPTZ,

    cancelled_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_rides_passenger
        FOREIGN KEY (passenger_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_rides_community
        FOREIGN KEY (community_id)
        REFERENCES communities(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_rides_vehicle_driver
        FOREIGN KEY (vehicle_id, driver_id)
        REFERENCES vehicles(id, driver_id)
        ON DELETE SET NULL,

    CONSTRAINT chk_pickup_lat
        CHECK (pickup_lat BETWEEN -90 AND 90),

    CONSTRAINT chk_pickup_lng
        CHECK (pickup_lng BETWEEN -180 AND 180),

    CONSTRAINT chk_destination_lat
        CHECK (destination_lat BETWEEN -90 AND 90),

    CONSTRAINT chk_destination_lng
        CHECK (destination_lng BETWEEN -180 AND 180)
);

-- =========================================================
-- DRIVER LOCATIONS
-- =========================================================

CREATE TABLE driver_locations (
    id BIGSERIAL PRIMARY KEY,

    ride_id UUID NOT NULL,

    driver_id UUID NOT NULL,

    latitude DOUBLE PRECISION NOT NULL,

    longitude DOUBLE PRECISION NOT NULL,

    speed DOUBLE PRECISION,

    heading DOUBLE PRECISION,

    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_driver_locations_ride
        FOREIGN KEY (ride_id)
        REFERENCES rides(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_driver_locations_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_driver_location_lat
        CHECK (latitude BETWEEN -90 AND 90),

    CONSTRAINT chk_driver_location_lng
        CHECK (longitude BETWEEN -180 AND 180),

    CONSTRAINT chk_driver_speed
        CHECK (speed IS NULL OR speed >= 0),

    CONSTRAINT chk_driver_heading
        CHECK (heading IS NULL OR heading BETWEEN 0 AND 360)
);

-- =========================================================
-- RIDE STATUS HISTORY
-- =========================================================

CREATE TABLE ride_status_history (
    id BIGSERIAL PRIMARY KEY,

    ride_id UUID NOT NULL,

    status ride_status NOT NULL,

    changed_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_status_history_ride
        FOREIGN KEY (ride_id)
        REFERENCES rides(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_status_history_user
        FOREIGN KEY (changed_by)
        REFERENCES users(id)
        ON DELETE SET NULL
);

-- =========================================================
-- INCIDENTS
-- =========================================================

CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    ride_id UUID,

    vehicle_id UUID,

    driver_id UUID,

    reported_by UUID,

    type incident_type NOT NULL,

    status incident_status NOT NULL DEFAULT 'OPEN',

    latitude DOUBLE PRECISION,

    longitude DOUBLE PRECISION,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    resolved_at TIMESTAMPTZ,

    CONSTRAINT fk_incidents_ride
        FOREIGN KEY (ride_id)
        REFERENCES rides(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_incidents_vehicle
        FOREIGN KEY (vehicle_id)
        REFERENCES vehicles(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_incidents_driver
        FOREIGN KEY (driver_id)
        REFERENCES drivers(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_incidents_reported_by
        FOREIGN KEY (reported_by)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_incident_lat
        CHECK (
            latitude IS NULL
            OR latitude BETWEEN -90 AND 90
        ),

    CONSTRAINT chk_incident_lng
        CHECK (
            longitude IS NULL
            OR longitude BETWEEN -180 AND 180
        )
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_users_role
    ON users(role);

CREATE INDEX idx_users_status
    ON users(status);

CREATE INDEX idx_communities_active
    ON communities(active);

CREATE INDEX idx_community_members_user
    ON community_members(user_id);

CREATE INDEX idx_community_members_community
    ON community_members(community_id);

CREATE INDEX idx_drivers_status
    ON drivers(status);

CREATE INDEX idx_drivers_approval_status
    ON drivers(approval_status);

CREATE INDEX idx_vehicles_driver
    ON vehicles(driver_id);

CREATE INDEX idx_rides_passenger
    ON rides(passenger_id);

CREATE INDEX idx_rides_driver
    ON rides(driver_id);

CREATE INDEX idx_rides_community
    ON rides(community_id);

CREATE INDEX idx_rides_status
    ON rides(status);

CREATE INDEX idx_rides_scheduled_at
    ON rides(scheduled_at);

CREATE INDEX idx_rides_active
    ON rides(status)
    WHERE status IN (
        'REQUESTED',
        'SEARCHING',
        'ACCEPTED',
        'DRIVER_ARRIVING',
        'DRIVER_WAITING',
        'IN_PROGRESS'
    );

CREATE INDEX idx_driver_locations_ride
    ON driver_locations(ride_id);

CREATE INDEX idx_driver_locations_driver
    ON driver_locations(driver_id);

CREATE INDEX idx_driver_locations_recorded_at
    ON driver_locations(recorded_at);

CREATE INDEX idx_ride_status_history_ride
    ON ride_status_history(ride_id);

CREATE INDEX idx_ride_status_history_created_at
    ON ride_status_history(created_at);

CREATE INDEX idx_incidents_status
    ON incidents(status);

CREATE INDEX idx_incidents_ride
    ON incidents(ride_id);

CREATE INDEX idx_incidents_vehicle
    ON incidents(vehicle_id);

CREATE INDEX idx_incidents_created_at
    ON incidents(created_at);