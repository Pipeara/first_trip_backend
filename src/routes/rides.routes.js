import express from "express";

import {
    authenticateToken,
    authorizeRoles
} from "../middleware/auth.middleware.js";

import {
    getRides,
    getRideById,
    createRide,
    acceptRide,
    searchRide,
    arrivingRide,
    waitingRide
} from "../controllers/rides.controller.js";

const router = express.Router();

router.get("/", getRides);

router.get("/:id", getRideById);

router.post(
    "/",
    authenticateToken,
    createRide
);

router.patch(
    "/:id/search",
    authenticateToken,
    authorizeRoles("PASSENGER"),
    searchRide
);

router.patch(
    "/:id/accept",
    authenticateToken,
    authorizeRoles("DRIVER"),
    acceptRide
);

router.patch(
    "/:id/arriving",
    authenticateToken,
    authorizeRoles("DRIVER"),
    arrivingRide
);

router.patch(
    "/:id/waiting",
    authenticateToken,
    authorizeRoles("DRIVER"),
    waitingRide
);

export default router;