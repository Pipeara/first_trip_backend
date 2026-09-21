
import { pool } from "../config/db.js";
import { startRideSearch } from "../services/ride-search.service.js";


export async function getRides(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                id,
                passenger_id,
                driver_id,
                vehicle_id,
                community_id,
                status,
                scheduled_at,
                created_at
            FROM rides
            ORDER BY created_at DESC
        `);

        res.json({
            message: "Lista de viajes",
            rides: result.rows
        });

    } catch (error) {
        console.error("Error al obtener viajes:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function getRideById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                passenger_id,
                driver_id,
                vehicle_id,
                community_id,
                pickup_lat,
                pickup_lng,
                pickup_address,
                destination_lat,
                destination_lng,
                destination_address,
                status,
                scheduled_at,
                requested_at,
                created_at,
                updated_at
            FROM rides
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Viaje no encontrado"
            });
        }

        res.json({
            message: "Viaje encontrado",
            ride: result.rows[0]
        });

    } catch (error) {
        console.error("Error al obtener viaje:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function createRide(req, res) {
    try {
        const passengerId = req.user.userId;

        const {
            community_id,
            pickup_lat,
            pickup_lng,
            pickup_address,
            destination_lat,
            destination_lng,
            destination_address
        } = req.body;

        if (!community_id) {
            return res.status(400).json({
                message: "community_id es obligatorio"
            });
        }

        if (
            pickup_lat === undefined ||
            pickup_lng === undefined
        ) {
            return res.status(400).json({
                message: "pickup_lat y pickup_lng son obligatorios"
            });
        }

        if (!pickup_address) {
            return res.status(400).json({
                message: "pickup_address es obligatorio"
            });
        }

        if (
            destination_lat === undefined ||
            destination_lng === undefined
        ) {
            return res.status(400).json({
                message: "destination_lat y destination_lng son obligatorios"
            });
        }

        if (!destination_address) {
            return res.status(400).json({
                message: "destination_address es obligatorio"
            });
        }

        const userResult = await pool.query(
            `
            SELECT
                id,
                role,
                status
            FROM users
            WHERE id = $1
            `,
            [passengerId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const user = userResult.rows[0];

        if (user.role !== "PASSENGER") {
            return res.status(403).json({
                message: "Solo un PASSENGER puede solicitar un viaje"
            });
        }

        if (user.status !== "ACTIVE") {
            return res.status(403).json({
                message: "El usuario no está activo"
            });
        }

        const communityResult = await pool.query(
            `
            SELECT
                id,
                name,
                active
            FROM communities
            WHERE id = $1
            `,
            [community_id]
        );

        if (communityResult.rows.length === 0) {
            return res.status(404).json({
                message: "Community no encontrada"
            });
        }

        const community = communityResult.rows[0];

        if (!community.active) {
            return res.status(400).json({
                message: "La Community no está activa"
            });
        }

        const membershipResult = await pool.query(
            `
            SELECT
                id,
                community_id,
                user_id,
                membership_status
            FROM community_members
            WHERE community_id = $1
              AND user_id = $2
              AND membership_status = 'ACTIVE'
            `,
            [community_id, passengerId]
        );

        if (membershipResult.rows.length === 0) {
            return res.status(403).json({
                message: "El usuario no pertenece a esta Community"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO rides (
                passenger_id,
                community_id,
                pickup_lat,
                pickup_lng,
                pickup_address,
                destination_lat,
                destination_lng,
                destination_address
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING
                id,
                passenger_id,
                driver_id,
                vehicle_id,
                community_id,
                pickup_lat,
                pickup_lng,
                pickup_address,
                destination_lat,
                destination_lng,
                destination_address,
                status,
                scheduled_at,
                requested_at,
                created_at,
                updated_at
            `,
            [
                passengerId,
                community_id,
                pickup_lat,
                pickup_lng,
                pickup_address,
                destination_lat,
                destination_lng,
                destination_address
            ]
        );

        res.status(201).json({
            message: "Viaje creado correctamente",
            ride: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error al crear viaje:",
            error.message
        );

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function acceptRide(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await client.query("BEGIN");

        const userResult = await client.query(
            `
            SELECT
                id,
                role,
                status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const user = userResult.rows[0];

        if (user.role !== "DRIVER") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Solo un DRIVER puede aceptar viajes"
            });
        }

        if (user.status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El usuario no está activo"
            });
        }

        const driverResult = await client.query(
            `
            SELECT
                id,
                user_id,
                approval_status,
                status
            FROM drivers
            WHERE user_id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (driverResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        const driver = driverResult.rows[0];

        if (driver.approval_status !== "APPROVED") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está aprobado"
            });
        }

        if (driver.status !== "ONLINE") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El conductor no está disponible"
            });
        }

        const vehicleResult = await client.query(
            `
            SELECT
                id,
                driver_id,
                brand,
                model,
                year,
                plate,
                color,
                active
            FROM vehicles
            WHERE driver_id = $1
              AND active = TRUE
            FOR UPDATE
            `,
            [driver.id]
        );

        if (vehicleResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El conductor no tiene un vehículo activo"
            });
        }

        const vehicle = vehicleResult.rows[0];

        const rideResult = await client.query(
            `
            SELECT
                id,
                passenger_id,
                driver_id,
                vehicle_id,
                community_id,
                status,
                requested_at,
                accepted_at
            FROM rides
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (rideResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Viaje no encontrado"
            });
        }

        const ride = rideResult.rows[0];

        if (ride.status !== "SEARCHING") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El viaje no está disponible para ser aceptado",
                current_status: ride.status
            });
        }

        const updateRideResult = await client.query(
            `
            UPDATE rides
            SET
                driver_id = $1,
                vehicle_id = $2,
                status = 'ACCEPTED',
                accepted_at = NOW(),
                updated_at = NOW()
            WHERE id = $3
            RETURNING
                id,
                passenger_id,
                driver_id,
                vehicle_id,
                community_id,
                pickup_lat,
                pickup_lng,
                pickup_address,
                destination_lat,
                destination_lng,
                destination_address,
                status,
                scheduled_at,
                requested_at,
                accepted_at,
                created_at,
                updated_at
            `,
            [driver.id, vehicle.id, id]
        );

        await client.query(
            `
            UPDATE drivers
            SET
                status = 'BUSY',
                updated_at = NOW()
            WHERE id = $1
            `,
            [driver.id]
        );

        await client.query(
            `
            INSERT INTO ride_status_history (
                ride_id,
                status,
                changed_by
            )
            VALUES ($1, $2, $3)
            `,
            [id, "ACCEPTED", userId]
        );

        await client.query("COMMIT");

        res.json({
            message: "Viaje aceptado correctamente",
            ride: updateRideResult.rows[0],
            driver: {
                id: driver.id,
                status: "BUSY"
            },
            vehicle: {
                id: vehicle.id,
                brand: vehicle.brand,
                model: vehicle.model,
                plate: vehicle.plate
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error al aceptar viaje:",
            error.message
        );

        res.status(500).json({
            message: "Error interno del servidor"
        });

    } finally {
        client.release();
    }
}


export async function searchRide(req, res) {
    try {
        const { id } = req.params;

        const result = await startRideSearch(id);

        res.json({
            message: result.searching
                ? "Búsqueda de conductores iniciada"
                : "No hay conductores disponibles",
            ride: result.ride,
            searching: result.searching,
            drivers_found: result.drivers.length,
            drivers: result.drivers
        });

    } catch (error) {
        console.error(
            "Error al iniciar búsqueda de conductores:",
            error.message
        );

        if (error.statusCode) {
            return res.status(error.statusCode).json({
                message: error.message,
                current_status: error.currentStatus
            });
        }

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function arrivingRide(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await client.query("BEGIN");

        const userResult = await client.query(
            `
            SELECT id, role, status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const user = userResult.rows[0];

        if (user.role !== "DRIVER") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Solo un DRIVER puede marcar un viaje como DRIVER_ARRIVING"
            });
        }

        if (user.status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El usuario no está activo"
            });
        }

        const driverResult = await client.query(
            `
            SELECT id, user_id, approval_status, status
            FROM drivers
            WHERE user_id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (driverResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        const driver = driverResult.rows[0];

        if (driver.approval_status !== "APPROVED") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está aprobado"
            });
        }

        if (driver.status !== "BUSY") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El conductor no está ocupado con un viaje"
            });
        }

        const rideResult = await client.query(
            `
            SELECT
                id,
                passenger_id,
                driver_id,
                vehicle_id,
                community_id,
                pickup_lat,
                pickup_lng,
                pickup_address,
                destination_lat,
                destination_lng,
                destination_address,
                status,
                scheduled_at,
                requested_at,
                accepted_at,
                created_at,
                updated_at
            FROM rides
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (rideResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Viaje no encontrado"
            });
        }

        const ride = rideResult.rows[0];

        if (ride.driver_id !== driver.id) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está asignado a este viaje"
            });
        }

        if (ride.status !== "ACCEPTED") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El viaje no está en estado ACCEPTED",
                current_status: ride.status
            });
        }

        const updateRideResult = await client.query(
            `
            UPDATE rides
            SET
                status = 'DRIVER_ARRIVING',
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        await client.query(
            `
            INSERT INTO ride_status_history (
                ride_id,
                status,
                changed_by
            )
            VALUES ($1, $2, $3)
            `,
            [id, "DRIVER_ARRIVING", userId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "El conductor está en camino",
            ride: updateRideResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error al marcar viaje como DRIVER_ARRIVING:",
            error.message
        );

        return res.status(500).json({
            message: "Error interno del servidor"
        });

    } finally {
        client.release();
    }
}


export async function waitingRide(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await client.query("BEGIN");

        const userResult = await client.query(
            `
            SELECT id, role, status
            FROM users
            WHERE id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (userResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const user = userResult.rows[0];

        if (user.role !== "DRIVER") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Solo un DRIVER puede marcar un viaje como DRIVER_WAITING"
            });
        }

        if (user.status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El usuario no está activo"
            });
        }

        const driverResult = await client.query(
            `
            SELECT id, user_id, approval_status, status
            FROM drivers
            WHERE user_id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (driverResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        const driver = driverResult.rows[0];

        if (driver.approval_status !== "APPROVED") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está aprobado"
            });
        }

        if (driver.status !== "BUSY") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El conductor no está ocupado con un viaje"
            });
        }

        const rideResult = await client.query(
            `
            SELECT
                id,
                passenger_id,
                driver_id,
                vehicle_id,
                community_id,
                pickup_lat,
                pickup_lng,
                pickup_address,
                destination_lat,
                destination_lng,
                destination_address,
                status,
                scheduled_at,
                requested_at,
                accepted_at,
                created_at,
                updated_at
            FROM rides
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (rideResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Viaje no encontrado"
            });
        }

        const ride = rideResult.rows[0];

        if (ride.driver_id !== driver.id) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está asignado a este viaje"
            });
        }

        if (ride.status !== "DRIVER_ARRIVING") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El viaje no está en estado DRIVER_ARRIVING",
                current_status: ride.status
            });
        }

        const updateRideResult = await client.query(
            `
            UPDATE rides
            SET
                status = 'DRIVER_WAITING',
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        await client.query(
            `
            INSERT INTO ride_status_history (
                ride_id,
                status,
                changed_by
            )
            VALUES ($1, $2, $3)
            `,
            [id, "DRIVER_WAITING", userId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "El conductor ha llegado y está esperando al pasajero",
            ride: updateRideResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error al marcar viaje como DRIVER_WAITING:",
            error.message
        );

        return res.status(500).json({
            message: "Error interno del servidor"
        });

    } finally {
        client.release();
    }
}


export async function startRide(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await client.query("BEGIN");

        const driverResult = await client.query(
            `
            SELECT
                d.id,
                d.user_id,
                d.approval_status,
                d.status,
                u.role,
                u.status AS user_status
            FROM drivers d
            INNER JOIN users u ON u.id = d.user_id
            WHERE d.user_id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (driverResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        const driver = driverResult.rows[0];

        if (driver.role !== "DRIVER") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Solo un DRIVER puede iniciar un viaje"
            });
        }

        if (driver.user_status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El usuario no está activo"
            });
        }

        if (driver.approval_status !== "APPROVED") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está aprobado"
            });
        }

        if (driver.status !== "BUSY") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El conductor no está ocupado con un viaje"
            });
        }

        const rideResult = await client.query(
            `
            SELECT *
            FROM rides
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (rideResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Viaje no encontrado"
            });
        }

        const ride = rideResult.rows[0];

        if (ride.driver_id !== driver.id) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está asignado a este viaje"
            });
        }

        if (ride.status !== "DRIVER_WAITING") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El viaje no está en estado DRIVER_WAITING",
                current_status: ride.status
            });
        }

        const updateRideResult = await client.query(
            `
            UPDATE rides
            SET
                status = 'IN_PROGRESS',
                started_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        await client.query(
            `
            INSERT INTO ride_status_history (
                ride_id,
                status,
                changed_by
            )
            VALUES ($1, $2, $3)
            `,
            [id, "IN_PROGRESS", userId]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "El viaje ha comenzado",
            ride: updateRideResult.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error al iniciar viaje:",
            error.message
        );

        return res.status(500).json({
            message: "Error interno del servidor"
        });

    } finally {
        client.release();
    }
}


export async function completeRide(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const userId = req.user.userId;

        await client.query("BEGIN");

        const driverResult = await client.query(
            `
            SELECT
                d.id,
                d.user_id,
                d.approval_status,
                d.status,
                u.role,
                u.status AS user_status
            FROM drivers d
            INNER JOIN users u ON u.id = d.user_id
            WHERE d.user_id = $1
            FOR UPDATE
            `,
            [userId]
        );

        if (driverResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        const driver = driverResult.rows[0];

        if (driver.role !== "DRIVER") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "Solo un DRIVER puede completar un viaje"
            });
        }

        if (driver.user_status !== "ACTIVE") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El usuario no está activo"
            });
        }

        if (driver.approval_status !== "APPROVED") {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está aprobado"
            });
        }

        if (driver.status !== "BUSY") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El conductor no está ocupado con un viaje"
            });
        }

        const rideResult = await client.query(
            `
            SELECT *
            FROM rides
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (rideResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Viaje no encontrado"
            });
        }

        const ride = rideResult.rows[0];

        if (ride.driver_id !== driver.id) {
            await client.query("ROLLBACK");

            return res.status(403).json({
                message: "El conductor no está asignado a este viaje"
            });
        }

        if (ride.status !== "IN_PROGRESS") {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El viaje no está en estado IN_PROGRESS",
                current_status: ride.status
            });
        }

        const updateRideResult = await client.query(
            `
            UPDATE rides
            SET
                status = 'COMPLETED',
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        await client.query(
            `
            INSERT INTO ride_status_history (
                ride_id,
                status,
                changed_by
            )
            VALUES ($1, $2, $3)
            `,
            [id, "COMPLETED", userId]
        );

        await client.query(
            `
            UPDATE drivers
            SET
                status = 'ONLINE',
                updated_at = NOW()
            WHERE id = $1
            `,
            [driver.id]
        );

        await client.query("COMMIT");

        return res.status(200).json({
            message: "El viaje ha sido completado",
            ride: updateRideResult.rows[0],
            driver: {
                id: driver.id,
                status: "ONLINE"
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error al completar viaje:",
            error.message
        );

        return res.status(500).json({
            message: "Error interno del servidor"
        });

    } finally {
        client.release();
    }
}


export async function cancelRide(req, res) {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        await client.query("BEGIN");

        const rideResult = await client.query(
            `
            SELECT *
            FROM rides
            WHERE id = $1
            FOR UPDATE
            `,
            [id]
        );

        if (rideResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Viaje no encontrado"
            });
        }

        const ride = rideResult.rows[0];

        const cancellableStatuses = [
            "REQUESTED",
            "SEARCHING",
            "ACCEPTED",
            "DRIVER_ARRIVING",
            "DRIVER_WAITING"
        ];

        if (!cancellableStatuses.includes(ride.status)) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "El viaje no puede ser cancelado en su estado actual",
                current_status: ride.status
            });
        }

        let driver = null;

        if (userRole === "PASSENGER") {
            if (ride.passenger_id !== userId) {
                await client.query("ROLLBACK");

                return res.status(403).json({
                    message: "No puedes cancelar este viaje"
                });
            }

            if (ride.driver_id) {
                const driverResult = await client.query(
                    `
                    SELECT
                        id,
                        user_id,
                        status,
                        approval_status
                    FROM drivers
                    WHERE id = $1
                    FOR UPDATE
                    `,
                    [ride.driver_id]
                );

                if (driverResult.rows.length === 0) {
                    await client.query("ROLLBACK");

                    return res.status(404).json({
                        message: "Conductor asignado no encontrado"
                    });
                }

                driver = driverResult.rows[0];

                if (driver.status !== "BUSY") {
                    await client.query("ROLLBACK");

                    return res.status(409).json({
                        message: "El conductor asignado no está en estado BUSY"
                    });
                }
            }

        } else if (userRole === "DRIVER") {
            const driverResult = await client.query(
                `
                SELECT
                    id,
                    user_id,
                    status,
                    approval_status
                FROM drivers
                WHERE user_id = $1
                FOR UPDATE
                `,
                [userId]
            );

            if (driverResult.rows.length === 0) {
                await client.query("ROLLBACK");

                return res.status(404).json({
                    message: "Conductor no encontrado"
                });
            }

            driver = driverResult.rows[0];

            if (ride.driver_id !== driver.id) {
                await client.query("ROLLBACK");

                return res.status(403).json({
                    message: "El conductor no está asignado a este viaje"
                });
            }

            if (driver.approval_status !== "APPROVED") {
                await client.query("ROLLBACK");

                return res.status(403).json({
                    message: "El conductor no está aprobado"
                });
            }

            if (driver.status !== "BUSY") {
                await client.query("ROLLBACK");

                return res.status(409).json({
                    message: "El conductor no está en estado BUSY"
                });
            }
        }

        const updateRideResult = await client.query(
            `
            UPDATE rides
            SET
                status = 'CANCELLED',
                cancelled_at = NOW(),
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
            [id]
        );

        await client.query(
            `
            INSERT INTO ride_status_history (
                ride_id,
                status,
                changed_by
            )
            VALUES ($1, $2, $3)
            `,
            [id, "CANCELLED", userId]
        );

        if (driver) {
            await client.query(
                `
                UPDATE drivers
                SET
                    status = 'ONLINE',
                    updated_at = NOW()
                WHERE id = $1
                `,
                [driver.id]
            );
        }

        await client.query("COMMIT");

        return res.status(200).json({
            message: "El viaje ha sido cancelado",
            ride: updateRideResult.rows[0],
            driver: driver
                ? {
                    id: driver.id,
                    status: "ONLINE"
                }
                : null
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error(
            "Error al cancelar viaje:",
            error.message
        );

        return res.status(500).json({
            message: "Error interno del servidor"
        });

    } finally {
        client.release();
    }
}