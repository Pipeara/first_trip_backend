
import { WebSocketServer } from "ws";

import {
    handleWebSocketMessage,
    handleWebSocketDisconnect
} from "./websocket.events.js";

let wss;

export function initializeWebSocket(server) {
    wss = new WebSocketServer({
        server,
        path: "/ws"
    });

    wss.on("connection", (socket, request) => {
        console.log("🔌 WebSocket conectado");

        socket.send(
            JSON.stringify({
                type: "connection.established",
                message: "Conexión WebSocket establecida"
            })
        );

        socket.on("message", (message) => {
            try {
                const data = JSON.parse(
                    message.toString()
                );

                console.log(
                    "📨 WebSocket message:",
                    data
                );

                handleWebSocketMessage(
                    socket,
                    data
                );

            } catch (error) {
                console.error(
                    "Error procesando mensaje WebSocket:",
                    error
                );

                socket.send(
                    JSON.stringify({
                        type: "error",
                        message: "Mensaje WebSocket inválido"
                    })
                );
            }
        });

        socket.on("close", () => {
            console.log(
                "🔌 WebSocket desconectado"
            );

            handleWebSocketDisconnect(
                socket
            );
        });

        socket.on("error", (error) => {
            console.error(
                "Error WebSocket:",
                error
            );
        });
    });

    console.log(
        "🔌 WebSocket server initialized on ws://localhost:3000/ws"
    );

    return wss;
}

export function getWebSocketServer() {
    return wss;
}

