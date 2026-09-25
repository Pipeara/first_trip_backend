import express from "express";

import cors from "cors";

import {
    authenticateToken,
    authorizeRoles
} from "./middleware/auth.middleware.js";

import ridesRoutes from "./routes/rides.routes.js";

import usersRoutes from "./routes/users.routes.js";

import communitiesRoutes from "./routes/communities.routes.js";

import driversRoutes from "./routes/drivers.routes.js";

import vehiclesRoutes from "./routes/vehicles.routes.js";

import authRoutes from "./routes/auth.routes.js";

import mapsRoutes from "./routes/maps.routes.js";


const app = express();


app.use(cors());

app.use(express.json());


app.get("/health", (req, res) => {

    res.json({

        status: "ok",

        service: "first-trip-api"

    });

});


app.get(
    "/api/v1/auth/me",
    authenticateToken,
    (req, res) => {

        res.json({

            message: "Token válido",

            user: req.user

        });

    }
);


app.get(
    "/api/v1/auth/test-driver",
    authenticateToken,
    authorizeRoles("DRIVER"),
    (req, res) => {

        res.json({

            message: "Acceso permitido para DRIVER",

            user: req.user

        });

    }
);


app.use("/api/v1/rides", ridesRoutes);

app.use("/api/v1/users", usersRoutes);

app.use("/api/v1/communities", communitiesRoutes);

app.use("/api/v1/drivers", driversRoutes);

app.use("/api/v1/vehicles", vehiclesRoutes);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/maps", mapsRoutes);


export default app;