
import { pool } from "../config/db.js";
import { addRideStatusHistory } from "./ride-history.service.js";


export async function startRideSearch(rideId, changedBy = null) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");


        // 1. Bloquear el viaje
        const rideResult = await client.query(
            `
            SELECT
                id,
                passenger_id,
                community_id,
                status
            FROM rides
            WHERE id = $1
            FOR UPDATE
            `,
            [rideId]
        );


        if (rideResult.rows.length === 0) {
            const error = new Error(
                "Viaje no encontrado"
            );

            error.statusCode = 404;

            throw error;
        }


        const ride = rideResult.rows[0];


        // 2. Solo REQUESTED puede pasar a SEARCHING
        if (ride.status !== "REQUESTED") {
            const error = new Error(
                "El viaje no está en estado REQUESTED"
            );

            error.statusCode = 409;
            error.currentStatus = ride.status;

            throw error;
        }


        // 3. Buscar conductores disponibles
        const driversResult = await client.query(
            `
            SELECT
                d.id,
                d.user_id,
                d.status,
                d.approval_status
            FROM drivers d
            INNER JOIN users u
                ON u.id = d.user_id
            WHERE d.approval_status = 'APPROVED'
              AND d.status = 'ONLINE'
              AND u.status = 'ACTIVE'
            ORDER BY d.created_at ASC
            `
        );


        // 4. No hay conductores disponibles
        if (driversResult.rows.length === 0) {

            await client.query("COMMIT");

            return {
                ride,
                status: "REQUESTED",
                searching: false,
                drivers: []
            };
        }


        // 5. REQUESTED → SEARCHING
        const updateResult = await client.query(
            `
            UPDATE rides
            SET
                status = 'SEARCHING',
                updated_at = NOW()
            WHERE id = $1
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
            [rideId]
        );


        // 6. Registrar transición
        await addRideStatusHistory(client, {
            rideId,
            status: "SEARCHING",
            changedBy
        });


        await client.query("COMMIT");


        return {
            ride: updateResult.rows[0],
            status: "SEARCHING",
            searching: true,
            drivers: driversResult.rows
        };


    } catch (error) {

        await client.query("ROLLBACK");

        throw error;

    } finally {

        client.release();

    }
}

