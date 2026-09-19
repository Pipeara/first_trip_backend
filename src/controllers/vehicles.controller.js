import { pool } from "../config/db.js";


export async function getVehicles(req, res) {
    try {
        const result = await pool.query(`
            SELECT
                id,
                driver_id,
                brand,
                model,
                year,
                plate,
                color,
                active,
                created_at,
                updated_at
            FROM vehicles
            ORDER BY created_at DESC
        `);

        res.json({
            message: "Lista de vehículos",
            vehicles: result.rows
        });

    } catch (error) {
        console.error("Error al obtener vehículos:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function getVehicleById(req, res) {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `
            SELECT
                id,
                driver_id,
                brand,
                model,
                year,
                plate,
                color,
                active,
                created_at,
                updated_at
            FROM vehicles
            WHERE id = $1
            `,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Vehículo no encontrado"
            });
        }

        res.json({
            message: "Vehículo encontrado",
            vehicle: result.rows[0]
        });

    } catch (error) {
        console.error("Error al obtener vehículo:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function createVehicle(req, res) {
    try {
        const {
            driver_id,
            brand,
            model,
            year,
            plate,
            color
        } = req.body;

        if (!driver_id) {
            return res.status(400).json({
                message: "driver_id es obligatorio"
            });
        }

        if (!brand) {
            return res.status(400).json({
                message: "brand es obligatorio"
            });
        }

        if (!model) {
            return res.status(400).json({
                message: "model es obligatorio"
            });
        }

        if (!plate) {
            return res.status(400).json({
                message: "plate es obligatorio"
            });
        }

        const driverResult = await pool.query(
            `
            SELECT
                id,
                user_id,
                approval_status,
                status
            FROM drivers
            WHERE id = $1
            `,
            [driver_id]
        );

        if (driverResult.rows.length === 0) {
            return res.status(404).json({
                message: "Conductor no encontrado"
            });
        }

        const existingVehicle = await pool.query(
            `
            SELECT id
            FROM vehicles
            WHERE plate = $1
            `,
            [plate]
        );

        if (existingVehicle.rows.length > 0) {
            return res.status(409).json({
                message: "La patente ya está registrada"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO vehicles (
                driver_id,
                brand,
                model,
                year,
                plate,
                color
            )
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING
                id,
                driver_id,
                brand,
                model,
                year,
                plate,
                color,
                active,
                created_at,
                updated_at
            `,
            [
                driver_id,
                brand,
                model,
                year ?? null,
                plate,
                color ?? null
            ]
        );

        res.status(201).json({
            message: "Vehículo creado correctamente",
            vehicle: result.rows[0]
        });

    } catch (error) {
        console.error("Error al crear vehículo:", error.message);

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function updateVehicleActive(req, res) {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (typeof active !== "boolean") {
            return res.status(400).json({
                message: "active debe ser boolean"
            });
        }

        const vehicleResult = await pool.query(
            `
            SELECT
                id,
                driver_id,
                brand,
                model,
                year,
                plate,
                color,
                active,
                created_at,
                updated_at
            FROM vehicles
            WHERE id = $1
            `,
            [id]
        );

        if (vehicleResult.rows.length === 0) {
            return res.status(404).json({
                message: "Vehículo no encontrado"
            });
        }

        const result = await pool.query(
            `
            UPDATE vehicles
            SET
                active = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING
                id,
                driver_id,
                brand,
                model,
                year,
                plate,
                color,
                active,
                created_at,
                updated_at
            `,
            [active, id]
        );

        res.json({
            message: "Estado del vehículo actualizado correctamente",
            vehicle: result.rows[0]
        });

    } catch (error) {
        console.error(
            "Error al actualizar estado del vehículo:",
            error.message
        );

        res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}