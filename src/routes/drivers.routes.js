import express from "express";

import {
    getDrivers,
    getDriverById,
    createDriver,
    updateDriverStatus
} from "../controllers/drivers.controller.js";

const router = express.Router();

router.get("/", getDrivers);

router.get("/:id", getDriverById);

router.post("/", createDriver);

router.patch("/:id/status", updateDriverStatus);

export default router;