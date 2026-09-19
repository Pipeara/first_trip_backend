import express from "express";

import {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicleActive
} from "../controllers/vehicles.controller.js";

const router = express.Router();

router.get("/", getVehicles);

router.get("/:id", getVehicleById);

router.post("/", createVehicle);

router.patch("/:id/active", updateVehicleActive);

export default router;