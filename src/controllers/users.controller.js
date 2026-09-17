import { pool } from "../config/db.js";

export async function getUsers(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                id,
                rut,
                name,
                email,
                role,
                created_at
            FROM users
            ORDER BY created_at DESC
        `);

        res.json({
            message: "Lista de usuarios",
            users: result.rows
        });

    } catch (error) {
        console.error("Error al obtener usuarios:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}