import express from "express";

import { getCommunities } from "../controllers/communities.controller.js";

const router = express.Router();

router.get("/", getCommunities);

export default router;