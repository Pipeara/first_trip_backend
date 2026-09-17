import express from "express";
import cors from "cors";
import ridesRoutes from "./routes/rides.routes.js";
import usersRoutes from "./routes/users.routes.js";

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

export default app;