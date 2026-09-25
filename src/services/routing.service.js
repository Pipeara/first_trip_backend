
const OSRM_BASE_URL = "https://router.project-osrm.org";

/**
 * Obtiene una ruta entre dos coordenadas usando OSRM.
 *
 * @param {Object} params
 * @param {number} params.pickupLat
 * @param {number} params.pickupLng
 * @param {number} params.destinationLat
 * @param {number} params.destinationLng
 * @returns {Promise<Object>}
 */
export async function getRoute({
    pickupLat,
    pickupLng,
    destinationLat,
    destinationLng
}) {
    const url =
        `${OSRM_BASE_URL}/route/v1/driving/` +
        `${pickupLng},${pickupLat};` +
        `${destinationLng},${destinationLat}` +
        `?overview=full&geometries=geojson`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Accept: "application/json"
        }
    });

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
        const body = await response.text();

        const error = new Error(
            "OSRM devolvió una respuesta que no es JSON"
        );

        error.statusCode = 502;
        error.osrmResponse = body.slice(0, 500);

        throw error;
    }

    const result = await response.json();

    if (!response.ok) {
        const error = new Error(
            "Error al consultar OSRM"
        );

        error.statusCode = 502;
        error.osrmResponse = result;

        throw error;
    }

    if (result.code !== "Ok") {
        const error = new Error(
            "OSRM no pudo calcular la ruta"
        );

        error.statusCode = 422;
        error.osrmResponse = result;

        throw error;
    }

    if (
        !result.routes ||
        result.routes.length === 0
    ) {
        const error = new Error(
            "OSRM no encontró una ruta"
        );

        error.statusCode = 422;

        throw error;
    }

    const route = result.routes[0];

    return {
        distanceMeters: route.distance,
        durationSeconds: route.duration,
        geometry: route.geometry
    };
}

