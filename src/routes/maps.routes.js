import { Router } from "express";
import { calculateRoute } from "../controllers/maps.controller.js";

const router = Router();

router.post("/route", calculateRoute);

export default router;