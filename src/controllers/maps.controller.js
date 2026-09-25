import { getRoute } from "../services/routing.service.js";

export async function calculateRoute(req, res) {
    try {
        const {
            pickup_lat,
            pickup_lng,
            destination_lat,
            destination_lng
        } = req.body;

        if (
            pickup_lat === undefined ||
            pickup_lng === undefined ||
            destination_lat === undefined ||
            destination_lng === undefined
        ) {
            return res.status(400).json({
                message: "Las coordenadas de origen y destino son obligatorias"
            });
        }

        const pickupLat = Number(pickup_lat);
        const pickupLng = Number(pickup_lng);
        const destinationLat = Number(destination_lat);
        const destinationLng = Number(destination_lng);

        if (
            !Number.isFinite(pickupLat) ||
            !Number.isFinite(pickupLng) ||
            !Number.isFinite(destinationLat) ||
            !Number.isFinite(destinationLng)
        ) {
            return res.status(400).json({
                message: "Las coordenadas deben ser números válidos"
            });
        }

        if (
            pickupLat < -90 ||
            pickupLat > 90 ||
            destinationLat < -90 ||
            destinationLat > 90
        ) {
            return res.status(400).json({
                message: "La latitud debe estar entre -90 y 90"
            });
        }

        if (
            pickupLng < -180 ||
            pickupLng > 180 ||
            destinationLng < -180 ||
            destinationLng > 180
        ) {
            return res.status(400).json({
                message: "La longitud debe estar entre -180 y 180"
            });
        }

        const route = await getRoute({
            pickupLat,
            pickupLng,
            destinationLat,
            destinationLng
        });

        return res.status(200).json({
            pickup: {
                lat: pickupLat,
                lng: pickupLng
            },
            destination: {
                lat: destinationLat,
                lng: destinationLng
            },
            route
        });

    } catch (error) {
        console.error("Error calculando ruta:", error);

        return res.status(
            error.statusCode || 500
        ).json({
            message: error.message || "Error calculando la ruta"
        });
    }
}