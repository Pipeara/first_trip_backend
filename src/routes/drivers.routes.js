import express from "express";

import {
    getDrivers,
    getDriverById,
    createDriver
} from "../controllers/drivers.controller.js";

const router = express.Router();

router.get("/", getDrivers);

router.get("/:id", getDriverById);

router.post("/", createDriver);

export default router;