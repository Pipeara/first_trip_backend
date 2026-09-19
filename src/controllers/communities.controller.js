import { pool } from "../config/db.js";

export async function getCommunities(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                id,
                name,
                address,
                active,
                created_at,
                updated_at
            FROM communities
            ORDER BY created_at DESC
        `);

        res.json({
            message: "Lista de comunidades",
            communities: result.rows
        });

    } catch (error) {
        console.error("Error al obtener comunidades:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}