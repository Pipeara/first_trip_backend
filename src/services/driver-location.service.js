
import { pool } from "../config/db.js";

export async function saveDriverLocation({
    rideId,
    driverId,
    latitude,
    longitude,
    speed = null,
    heading = null
}) {
    const result = await pool.query(
        `
        INSERT INTO driver_locations (
            ride_id,
            driver_id,
            latitude,
            longitude,
            speed,
            heading
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
            id,
            ride_id,
            driver_id,
            latitude,
            longitude,
            speed,
            heading,
            recorded_at
        `,
        [
            rideId,
            driverId,
            latitude,
            longitude,
            speed,
            heading
        ]
    );

    return result.rows[0];
}
