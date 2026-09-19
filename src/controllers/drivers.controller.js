
import { pool } from "../config/db.js";


export async function getDrivers(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                id,
                user_id,
                approval_status,
                status,
                created_at,
                updated_at
            FROM drivers
            ORDER BY created_at DESC
        `);

        res.json({
            message: "Lista de conductores",
            drivers: result.rows
        });

    } catch (error) {
        console.error("Error al obtener conductores:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function getDriverById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                user_id,
                approval_status,
                status,
                created_at,
                updated_at
            FROM drivers
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        res.json({
            message: "Conductor encontrado",
            driver: result.rows[0]
        });

    } catch (error) {
        console.error("Error al obtener conductor:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function createDriver(req, res) {
    try {
        const {
            user_id
        } = req.body;

        if (!user_id) {
            return res.status(400).json({
                message: "user_id es obligatorio"
            });
        }

        const userResult = await pool.query(
            `
            SELECT
                id,
                name,
                email,
                role,
                status
            FROM users
            WHERE id = $1
            `,
            [user_id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        const user = userResult.rows[0];

        if (user.role !== "DRIVER") {
            return res.status(400).json({
                message: "El usuario no tiene rol DRIVER"
            });
        }

        const existingDriver = await pool.query(
            `
            SELECT id
            FROM drivers
            WHERE user_id = $1
            `,
            [user_id]
        );

        if (existingDriver.rows.length > 0) {
            return res.status(409).json({
                message: "El usuario ya está registrado como conductor"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO drivers (
                user_id
            )
            VALUES ($1)
            RETURNING
                id,
                user_id,
                approval_status,
                status,
                created_at,
                updated_at
            `,
            [user_id]
        );

        res.status(201).json({
            message: "Conductor creado correctamente",
            driver: result.rows[0]
        });

    } catch (error) {
        console.error("Error al crear conductor:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function updateDriverStatus(req, res) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = [
            "OFFLINE",
            "ONLINE",
            "BUSY"
        ];

        if (!status) {
            return res.status(400).json({
                message: "status es obligatorio"
            });
        }

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "status inválido",
                valid_statuses: validStatuses
            });
        }

        const driverResult = await pool.query(
            `
            SELECT
                id,
                user_id,
                approval_status,
                status,
                created_at,
                updated_at
            FROM drivers
            WHERE id = $1
            `,
            [id]
        );

        if (driverResult.rows.length === 0) {
            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        const result = await pool.query(
            `
            UPDATE drivers
            SET
                status = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING
                id,
                user_id,
                approval_status,
                status,
                created_at,
                updated_at
            `,
            [status, id]
        );

        res.json({
            message: "Estado del conductor actualizado correctamente",
            driver: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error al actualizar estado del conductor:",
            error.message
        );

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}

