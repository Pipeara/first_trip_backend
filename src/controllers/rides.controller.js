import { pool } from "../config/db.js";

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