import bcrypt from "bcrypt";

import jwt from "jsonwebtoken";

import { pool } from "../config/db.js";


export async function register(req, res) {
    try {

        const {
            name,
            rut,
            email,
            phone,
            password
        } = req.body;


        if (!name) {
            return res.status(400).json({
                message: "name es obligatorio"
            });
        }


        if (!rut) {
            return res.status(400).json({
                message: "rut es obligatorio"
            });
        }


        if (!email) {
            return res.status(400).json({
                message: "email es obligatorio"
            });
        }


        if (!password) {
            return res.status(400).json({
                message: "password es obligatorio"
            });
        }


        const passwordHash = await bcrypt.hash(
            password,
            12
        );


        const result = await pool.query(
            `
            INSERT INTO users (
                name,
                rut,
                email,
                phone,
                password_hash
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING
                id,
                name,
                rut,
                email,
                phone,
                role,
                status,
                created_at
            `,
            [
                name,
                rut,
                email,
                phone || null,
                passwordHash
            ]
        );


        const user = result.rows[0];


        return res.status(201).json({
            message: "Usuario registrado correctamente",
            user
        });


    } catch (error) {

        console.error(
            "Error en registro:",
            error.message
        );


        if (error.code === "23505") {
            return res.status(409).json({
                message: "El RUT o email ya está registrado"
            });
        }


        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}


export async function login(req, res) {
    try {

        const {
            email,
            password
        } = req.body;


        if (!email) {
            return res.status(400).json({
                message: "email es obligatorio"
            });
        }


        if (!password) {
            return res.status(400).json({
                message: "password es obligatorio"
            });
        }


        const result = await pool.query(
            `
            SELECT
                id,
                name,
                rut,
                email,
                phone,
                password_hash,
                role,
                status
            FROM users
            WHERE email = $1
            `,
            [email]
        );


        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }


        const user = result.rows[0];


        const passwordValid = await bcrypt.compare(
            password,
            user.password_hash
        );


        if (!passwordValid) {
            return res.status(401).json({
                message: "Credenciales inválidas"
            });
        }


        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );


        return res.status(200).json({
            message: "Login correcto",
            accessToken: token,
            user: {
                id: user.id,
                name: user.name,
                rut: user.rut,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status
            }
        });


    } catch (error) {

        console.error(
            "Error en login:",
            error.message
        );


        return res.status(500).json({
            message: "Error interno del servidor"
        });
    }
}