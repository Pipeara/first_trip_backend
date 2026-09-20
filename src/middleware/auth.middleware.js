
import jwt from "jsonwebtoken";


export function authenticateToken(req, res, next) {

    try {

        const authHeader = req.headers.authorization;


        if (!authHeader) {
            return res.status(401).json({
                message: "Token de autenticación requerido"
            });
        }


        const parts = authHeader.split(" ");


        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Formato de token inválido"
            });
        }


        const token = parts[1];


        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        req.user = decoded;


        next();


    } catch (error) {

        console.error(
            "Error de autenticación:",
            error.message
        );


        return res.status(401).json({
            message: "Token inválido o expirado"
        });
    }
}


export function authorizeRoles(...allowedRoles) {

    return (req, res, next) => {

        if (!req.user) {
            return res.status(401).json({
                message: "Usuario no autenticado"
            });
        }


        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "No tienes permisos para realizar esta acción"
            });
        }


        next();
    };
}

