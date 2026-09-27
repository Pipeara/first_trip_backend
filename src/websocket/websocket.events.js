
import {
    addClientToRide,
    removeClientFromRide,
    broadcastToRide
} from "./websocket.clients.js";

import {
    saveDriverLocation
} from "../services/driver-location.service.js";

export function handleWebSocketMessage(socket, data) {
    if (!data || typeof data.type !== "string") {
        sendError(socket, "Evento WebSocket inválido");
        return;
    }

    switch (data.type) {
        case "ride.join":
            handleRideJoin(socket, data);
            break;

        case "ride.leave":
            handleRideLeave(socket, data);
            break;

        case "driver.location_updated":
            handleDriverLocationUpdated(socket, data);
            break;

        default:
            sendError(
                socket,
                `Evento WebSocket no soportado: ${data.type}`
            );
    }
}

function handleRideJoin(socket, data) {
    const rideId = data.rideId;

    if (
        typeof rideId !== "string" ||
        rideId.trim().length === 0
    ) {
        sendError(
            socket,
            "ride.join requiere un rideId válido"
        );
        return;
    }

    const normalizedRideId = rideId.trim();

    addClientToRide(
        normalizedRideId,
        socket
    );

    socket.currentRideId = normalizedRideId;

    socket.send(
        JSON.stringify({
            type: "ride.joined",
            rideId: normalizedRideId
        })
    );

    console.log(
        `🚗 WebSocket unido al ride: ${normalizedRideId}`
    );
}

function handleRideLeave(socket, data) {
    const rideId =
        typeof data.rideId === "string"
            ? data.rideId.trim()
            : socket.currentRideId;

    if (!rideId) {
        sendError(
            socket,
            "ride.leave requiere un rideId válido"
        );
        return;
    }

    removeClientFromRide(
        rideId,
        socket
    );

    if (socket.currentRideId === rideId) {
        socket.currentRideId = null;
    }

    socket.send(
        JSON.stringify({
            type: "ride.left",
            rideId
        })
    );

    console.log(
        `🚗 WebSocket salió del ride: ${rideId}`
    );
}

async function handleDriverLocationUpdated(socket, data) {
    const {
        rideId,
        driverId,
        latitude,
        longitude,
        speed = null,
        heading = null
    } = data;

    if (
        typeof rideId !== "string" ||
        rideId.trim().length === 0
    ) {
        sendError(
            socket,
            "driver.location_updated requiere un rideId válido"
        );
        return;
    }

    if (
        typeof driverId !== "string" ||
        driverId.trim().length === 0
    ) {
        sendError(
            socket,
            "driver.location_updated requiere un driverId válido"
        );
        return;
    }

    if (
        typeof latitude !== "number" ||
        !Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90
    ) {
        sendError(
            socket,
            "driver.location_updated requiere una latitude válida"
        );
        return;
    }

    if (
        typeof longitude !== "number" ||
        !Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180
    ) {
        sendError(
            socket,
            "driver.location_updated requiere una longitude válida"
        );
        return;
    }

    if (
        speed !== null &&
        (
            typeof speed !== "number" ||
            !Number.isFinite(speed) ||
            speed < 0
        )
    ) {
        sendError(
            socket,
            "speed debe ser un número válido mayor o igual a 0"
        );
        return;
    }

    if (
        heading !== null &&
        (
            typeof heading !== "number" ||
            !Number.isFinite(heading) ||
            heading < 0 ||
            heading > 360
        )
    ) {
        sendError(
            socket,
            "heading debe estar entre 0 y 360"
        );
        return;
    }

    const normalizedRideId = rideId.trim();
    const normalizedDriverId = driverId.trim();

    try {
        const location = await saveDriverLocation({
            rideId: normalizedRideId,
            driverId: normalizedDriverId,
            latitude,
            longitude,
            speed,
            heading
        });

        broadcastToRide(
            normalizedRideId,
            {
                type: "driver.location_updated",
                rideId: normalizedRideId,
                driverId: normalizedDriverId,
                location
            }
        );

        console.log(
            `📍 Driver ${normalizedDriverId} actualizado en ride ${normalizedRideId}: ${latitude}, ${longitude}`
        );

    } catch (error) {
        console.error(
            "Error guardando ubicación del driver:",
            error
        );

        sendError(
            socket,
            "No se pudo guardar la ubicación del driver"
        );
    }
}

export function handleWebSocketDisconnect(socket) {
    if (!socket.currentRideId) {
        return;
    }

    removeClientFromRide(
        socket.currentRideId,
        socket
    );

    console.log(
        `🚗 WebSocket salió del ride: ${socket.currentRideId}`
    );

    socket.currentRideId = null;
}

function sendError(socket, message) {
    socket.send(
        JSON.stringify({
            type: "error",
            message
        })
    );
}
