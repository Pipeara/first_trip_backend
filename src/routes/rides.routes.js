import express from "express";

import { getRides } from "../controllers/rides.controller.js";

const router = express.Router();

router.get("/", getRides);

export default router;