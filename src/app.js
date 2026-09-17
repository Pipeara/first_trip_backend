import express from "express";
import cors from "cors";
import ridesRoutes from "./routes/rides.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "first-trip-api"
    });
});

// Rides API
app.use("/api/v1/rides", ridesRoutes);

export default app;