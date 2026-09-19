
import express from "express";

import {
    getRides,
    getRideById,
    createRide
} from "../controllers/rides.controller.js";

const router = express.Router();

router.get("/", getRides);

router.get("/:id", getRideById);

router.post("/", createRide);

export default router;

