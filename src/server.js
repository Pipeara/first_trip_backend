
import dotenv from "dotenv";
import http from "node:http";

import app from "./app.js";
import { initializeWebSocket } from "./websocket/websocket.server.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

initializeWebSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(
        `🚀 First Trip API running on http://localhost:${PORT}`
    );
});

