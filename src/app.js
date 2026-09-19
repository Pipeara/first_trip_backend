import express from "express";

import cors from "cors";

import ridesRoutes from "./routes/rides.routes.js";

import usersRoutes from "./routes/users.routes.js";

import communitiesRoutes from "./routes/communities.routes.js";

import driversRoutes from "./routes/drivers.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/health", (req, res) => {

    res.json({

        status: "ok",

        service: "first-trip-api"

    });

});

app.use("/api/v1/rides", ridesRoutes);

app.use("/api/v1/users", usersRoutes);

app.use("/api/v1/communities", communitiesRoutes);

app.use("/api/v1/drivers", driversRoutes);

export default app;