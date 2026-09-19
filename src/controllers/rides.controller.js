
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

        const {
            passenger_id,
            community_id,
            pickup_lat,
            pickup_lng,
            pickup_address,
            destination_lat,
            destination_lng,
            destination_address
        } = req.body;

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
                passenger_id,
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
        console.error("Error al crear viaje:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}

