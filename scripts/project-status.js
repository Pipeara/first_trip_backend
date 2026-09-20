import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { pool } from "../src/config/db.js";

const ROOT = process.cwd();

const API_BASE_URL =
    process.env.API_BASE_URL || "http://localhost:3000";

// =========================================================
// HELPERS
// =========================================================

function exists(relativePath) {
    return fs.existsSync(
        path.join(ROOT, relativePath)
    );
}

function read(relativePath) {
    try {
        return fs.readFileSync(
            path.join(ROOT, relativePath),
            "utf8"
        );
    } catch {
        return "";
    }
}

function run(command) {
    try {
        return execSync(command, {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"]
        }).trim();
    } catch {
        return null;
    }
}

function printStatus(ok, message) {
    console.log(
        `${ok ? "✅" : "❌"} ${message}`
    );
}

function printPending(message) {
    console.log(
        `⏳ ${message}`
    );
}

function printProgress(title, completed, total) {
    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );

    console.log(
        `${title.padEnd(32)} ${String(percentage).padStart(3)}%`
    );

    return percentage;
}

function escapeRegExp(value) {
    return value.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

// =========================================================
// ROUTE DETECTION
// =========================================================

function routeContains(
    relativePath,
    method,
    route
) {
    const content = read(relativePath);

    if (!content) {
        return false;
    }

    /*
     * Convierte esto:
     *
     * router.patch(
     *     "/:id/accept",
     *     authenticateToken,
     *     authorizeRoles("DRIVER"),
     *     acceptRide
     * );
     *
     * en una sola línea lógica:
     *
     * router.patch( "/:id/accept", ...
     */

    const normalized = content
        .replace(/\s+/g, " ")
        .trim();

    const pattern =
        new RegExp(
            `router\\.${method}\\s*\\(\\s*["']${escapeRegExp(route)}["']`
        );

    return pattern.test(normalized);
}

function controllerContains(
    relativePath,
    text
) {
    const content = read(relativePath);

    return content.includes(text);
}

// =========================================================
// HTTP
// =========================================================

async function checkHttp(endpoint) {
    try {
        const response = await fetch(
            `${API_BASE_URL}${endpoint}`
        );

        return {
            available: true,
            status: response.status
        };

    } catch {
        return {
            available: false,
            status: null
        };
    }
}

// =========================================================
// DATABASE
// =========================================================

async function checkDatabase() {

    const result = {
        connected: false,
        tables: 0,
        users: 0,
        communities: 0,
        drivers: 0,
        vehicles: 0,
        rides: 0,
        history: 0
    };

    try {

        await pool.query("SELECT 1");

        result.connected = true;

        const tablesResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM information_schema.tables
                WHERE table_schema = 'public'
            `);

        result.tables =
            tablesResult.rows[0].count;

        const usersResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM users
            `);

        result.users =
            usersResult.rows[0].count;

        const communitiesResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM communities
            `);

        result.communities =
            communitiesResult.rows[0].count;

        const driversResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM drivers
            `);

        result.drivers =
            driversResult.rows[0].count;

        const vehiclesResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM vehicles
            `);

        result.vehicles =
            vehiclesResult.rows[0].count;

        const ridesResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM rides
            `);

        result.rides =
            ridesResult.rows[0].count;

        const historyResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM ride_status_history
            `);

        result.history =
            historyResult.rows[0].count;

    } catch (error) {

        console.error(
            `❌ Database error: ${error.message}`
        );
    }

    return result;
}

// =========================================================
// STATUS HISTORY
// =========================================================

async function getHistoryStatuses() {

    const result = {
        REQUESTED: false,
        SEARCHING: false,
        ACCEPTED: false,
        DRIVER_ARRIVING: false,
        DRIVER_WAITING: false,
        IN_PROGRESS: false,
        COMPLETED: false,
        CANCELLED: false
    };

    try {

        const historyResult =
            await pool.query(`
                SELECT DISTINCT status
                FROM ride_status_history
            `);

        for (
            const row
            of historyResult.rows
        ) {

            if (
                Object.prototype.hasOwnProperty.call(
                    result,
                    row.status
                )
            ) {
                result[row.status] = true;
            }
        }

    } catch {
        // La conexión ya se valida en checkDatabase().
    }

    return result;
}

// =========================================================
// MAIN
// =========================================================

async function main() {

    console.clear();

    console.log("");

    console.log(
        "╔══════════════════════════════════════════════════════════╗"
    );

    console.log(
        "║                 🚗 FIRST TRIP PROJECT BOARD             ║"
    );

    console.log(
        "╚══════════════════════════════════════════════════════════╝"
    );

    console.log("");

    // =====================================================
    // PROJECT
    // =====================================================

    console.log("📁 PROJECT");

    console.log(
        `   Path: ${ROOT}`
    );

    console.log("");

    // =====================================================
    // GIT
    // =====================================================

    console.log("🌿 GIT");

    const branch =
        run("git branch --show-current");

    const gitStatus =
        run("git status --porcelain");

    const commit =
        run("git log -1 --oneline");

    printStatus(
        !!branch,
        `Branch: ${branch || "desconocida"}`
    );

    if (gitStatus === "") {

        printStatus(
            true,
            "Working tree limpio"
        );

    } else {

        printStatus(
            false,
            "Hay cambios locales pendientes"
        );
    }

    console.log(
        `   Último commit: ${
            commit || "no disponible"
        }`
    );

    console.log("");

    // =====================================================
    // DATABASE
    // =====================================================

    console.log("🗄️ DATABASE");

    const database =
        await checkDatabase();

    printStatus(
        database.connected,
        database.connected
            ? "PostgreSQL conectado"
            : "PostgreSQL sin conexión"
    );

    if (database.connected) {

        console.log(
            `   Tables                 ${database.tables}`
        );

        console.log(
            `   Users                  ${database.users}`
        );

        console.log(
            `   Communities            ${database.communities}`
        );

        console.log(
            `   Drivers                ${database.drivers}`
        );

        console.log(
            `   Vehicles               ${database.vehicles}`
        );

        console.log(
            `   Rides                  ${database.rides}`
        );

        console.log(
            `   Status history         ${database.history}`
        );
    }

    console.log("");

    // =====================================================
    // SOURCE STRUCTURE
    // =====================================================

    console.log("📂 SOURCE STRUCTURE");

    printStatus(
        exists("src/server.js"),
        "src/server.js"
    );

    printStatus(
        exists("src/app.js"),
        "src/app.js"
    );

    printStatus(
        exists("src/config/db.js"),
        "src/config/db.js"
    );

    printStatus(
        exists("src/routes"),
        "src/routes/"
    );

    printStatus(
        exists("src/controllers"),
        "src/controllers/"
    );

    printStatus(
        exists("src/services"),
        "src/services/"
    );

    console.log("");

    // =====================================================
    // API
    // =====================================================

    console.log("🌐 API");

    const health =
        await checkHttp("/health");

    printStatus(
        health.available &&
        health.status === 200,

        health.available
            ? `Health                 HTTP ${health.status}`
            : "Health                 servidor no disponible"
    );

    const usersApi =
        await checkHttp("/api/v1/users");

    printStatus(
        usersApi.available &&
        usersApi.status === 200,

        usersApi.available
            ? `Users                  HTTP ${usersApi.status}`
            : "Users                  servidor no disponible"
    );

    const communitiesApi =
        await checkHttp(
            "/api/v1/communities"
        );

    printStatus(
        communitiesApi.available &&
        communitiesApi.status === 200,

        communitiesApi.available
            ? `Communities            HTTP ${communitiesApi.status}`
            : "Communities            servidor no disponible"
    );

    const driversApi =
        await checkHttp(
            "/api/v1/drivers"
        );

    printStatus(
        driversApi.available &&
        driversApi.status === 200,

        driversApi.available
            ? `Drivers                HTTP ${driversApi.status}`
            : "Drivers                servidor no disponible"
    );

    const vehiclesApi =
        await checkHttp(
            "/api/v1/vehicles"
        );

    printStatus(
        vehiclesApi.available &&
        vehiclesApi.status === 200,

        vehiclesApi.available
            ? `Vehicles               HTTP ${vehiclesApi.status}`
            : "Vehicles               servidor no disponible"
    );

    const ridesApi =
        await checkHttp(
            "/api/v1/rides"
        );

    printStatus(
        ridesApi.available &&
        ridesApi.status === 200,

        ridesApi.available
            ? `Rides                  HTTP ${ridesApi.status}`
            : "Rides                  servidor no disponible"
    );

    // =====================================================
    // DAY 6 — DRIVERS
    // =====================================================

    console.log("");
    console.log(
        "🚗 DÍA 6 — DRIVERS API"
    );

    const driverRoutes =
        "src/routes/drivers.routes.js";

    const driverController =
        "src/controllers/drivers.controller.js";

    const driverGet =
        routeContains(
            driverRoutes,
            "get",
            "/"
        );

    const driverGetById =
        routeContains(
            driverRoutes,
            "get",
            "/:id"
        );

    const driverPost =
        routeContains(
            driverRoutes,
            "post",
            "/"
        );

    const driverPatch =
        routeContains(
            driverRoutes,
            "patch",
            "/:id/status"
        );

    const driverStatusController =
        controllerContains(
            driverController,
            "updateDriverStatus"
        );

    printStatus(
        driverGet &&
        driversApi.available &&
        driversApi.status === 200,

        driverGet
            ? `GET /api/v1/drivers       ${
                driversApi.available
                    ? `HTTP ${driversApi.status}`
                    : "API offline"
            }`
            : "GET /api/v1/drivers"
    );

    printStatus(
        driverGetById,
        "GET /api/v1/drivers/:id"
    );

    printStatus(
        driverPost,
        "POST /api/v1/drivers"
    );

    printStatus(
        driverPatch &&
        driverStatusController,
        "PATCH /api/v1/drivers/:id/status"
    );

    const driversCompleted = [
        driverGet,
        driverGetById,
        driverPost,
        driverPatch &&
        driverStatusController
    ].filter(Boolean).length;

    const driversTotal = 4;

    const driversPercentage =
        printProgress(
            "   Progress",
            driversCompleted,
            driversTotal
        );

    // =====================================================
    // DAY 7 — VEHICLES
    // =====================================================

    console.log("");
    console.log(
        "🚘 DÍA 7 — VEHICLES API"
    );

    const vehiclesRoutes =
        "src/routes/vehicles.routes.js";

    const vehiclesController =
        "src/controllers/vehicles.controller.js";

    const vehicleGet =
        routeContains(
            vehiclesRoutes,
            "get",
            "/"
        );

    const vehicleGetById =
        routeContains(
            vehiclesRoutes,
            "get",
            "/:id"
        );

    const vehiclePost =
        routeContains(
            vehiclesRoutes,
            "post",
            "/"
        );

    const vehiclePatch =
        routeContains(
            vehiclesRoutes,
            "patch",
            "/:id/active"
        );

    printStatus(
        vehicleGet,
        "GET /api/v1/vehicles"
    );

    printStatus(
        vehicleGetById,
        "GET /api/v1/vehicles/:id"
    );

    printStatus(
        vehiclePost,
        "POST /api/v1/vehicles"
    );

    printStatus(
        vehiclePatch,
        "PATCH /api/v1/vehicles/:id/active"
    );

    const vehiclesCompleted = [
        vehicleGet,
        vehicleGetById,
        vehiclePost,
        vehiclePatch
    ].filter(Boolean).length;

    const vehiclesTotal = 4;

    const vehiclesPercentage =
        printProgress(
            "   Progress",
            vehiclesCompleted,
            vehiclesTotal
        );

    // =====================================================
    // DAY 8 — RIDES
    // =====================================================

    console.log("");
    console.log(
        "🚕 DÍA 8 — RIDES API"
    );

    const ridesRoutes =
        "src/routes/rides.routes.js";

    const ridesController =
        "src/controllers/rides.controller.js";

    const rideGet =
        routeContains(
            ridesRoutes,
            "get",
            "/"
        );

    const ridePost =
        routeContains(
            ridesRoutes,
            "post",
            "/"
        );

    const rideGetById =
        routeContains(
            ridesRoutes,
            "get",
            "/:id"
        );

    const rideSearch =
        routeContains(
            ridesRoutes,
            "patch",
            "/:id/search"
        );

    const rideAccept =
        routeContains(
            ridesRoutes,
            "patch",
            "/:id/accept"
        );

    const rideArriving =
        routeContains(
            ridesRoutes,
            "patch",
            "/:id/arriving"
        );

    const rideWaiting =
        routeContains(
            ridesRoutes,
            "patch",
            "/:id/waiting"
        );

    const rideStart =
        routeContains(
            ridesRoutes,
            "patch",
            "/:id/start"
        );

    const rideComplete =
        routeContains(
            ridesRoutes,
            "patch",
            "/:id/complete"
        );

    const rideCancel =
        routeContains(
            ridesRoutes,
            "patch",
            "/:id/cancel"
        );

    printStatus(
        rideGet &&
        ridesApi.available &&
        ridesApi.status === 200,

        rideGet
            ? `GET /api/v1/rides        ${
                ridesApi.available
                    ? `HTTP ${ridesApi.status}`
                    : "API offline"
            }`
            : "GET /api/v1/rides"
    );

    printStatus(
        ridePost,
        "POST /api/v1/rides"
    );

    printStatus(
        rideGetById,
        "GET /api/v1/rides/:id"
    );

    printStatus(
        rideSearch,
        "PATCH /api/v1/rides/:id/search"
    );

    printStatus(
        rideAccept,
        "PATCH /api/v1/rides/:id/accept"
    );

    if (rideArriving) {

        printStatus(
            true,
            "PATCH /api/v1/rides/:id/arriving"
        );

    } else {

        printPending(
            "PATCH /api/v1/rides/:id/arriving"
        );
    }

    if (rideWaiting) {

        printStatus(
            true,
            "PATCH /api/v1/rides/:id/waiting"
        );

    } else {

        printPending(
            "PATCH /api/v1/rides/:id/waiting"
        );
    }

    if (rideStart) {

        printStatus(
            true,
            "PATCH /api/v1/rides/:id/start"
        );

    } else {

        printPending(
            "PATCH /api/v1/rides/:id/start"
        );
    }

    if (rideComplete) {

        printStatus(
            true,
            "PATCH /api/v1/rides/:id/complete"
        );

    } else {

        printPending(
            "PATCH /api/v1/rides/:id/complete"
        );
    }

    if (rideCancel) {

        printStatus(
            true,
            "PATCH /api/v1/rides/:id/cancel"
        );

    } else {

        printPending(
            "PATCH /api/v1/rides/:id/cancel"
        );
    }

    printStatus(
        exists(ridesController),
        "Rides controller"
    );

    const rideFeatures = [
        rideGet,
        ridePost,
        rideGetById,
        rideSearch,
        rideAccept,
        rideArriving,
        rideWaiting,
        rideStart,
        rideComplete,
        rideCancel
    ];

    const ridesCompleted =
        rideFeatures.filter(Boolean).length;

    const ridesTotal =
        rideFeatures.length;

    const ridesPercentage =
        printProgress(
            "   Progress",
            ridesCompleted,
            ridesTotal
        );

    // =====================================================
    // RIDE LIFECYCLE
    // =====================================================

    console.log("");
    console.log(
        "🔄 RIDE LIFECYCLE"
    );

    printStatus(
        true,
        "REQUESTED"
    );

    printStatus(
        rideSearch,
        "REQUESTED → SEARCHING"
    );

    printStatus(
        rideAccept,
        "SEARCHING → ACCEPTED"
    );

    if (rideArriving) {

        printStatus(
            true,
            "ACCEPTED → DRIVER_ARRIVING"
        );

    } else {

        printPending(
            "ACCEPTED → DRIVER_ARRIVING"
        );
    }

    if (rideWaiting) {

        printStatus(
            true,
            "DRIVER_ARRIVING → DRIVER_WAITING"
        );

    } else {

        printPending(
            "DRIVER_ARRIVING → DRIVER_WAITING"
        );
    }

    if (rideStart) {

        printStatus(
            true,
            "DRIVER_WAITING → IN_PROGRESS"
        );

    } else {

        printPending(
            "DRIVER_WAITING → IN_PROGRESS"
        );
    }

    if (rideComplete) {

        printStatus(
            true,
            "IN_PROGRESS → COMPLETED"
        );

    } else {

        printPending(
            "IN_PROGRESS → COMPLETED"
        );
    }

    if (rideCancel) {

        printStatus(
            true,
            "Cancellation"
        );

    } else {

        printPending(
            "Cancellation"
        );
    }

    // =====================================================
    // STATUS HISTORY
    // =====================================================

    console.log("");
    console.log(
        "📜 RIDE STATUS HISTORY"
    );

    const historyStatuses =
        database.connected
            ? await getHistoryStatuses()
            : {
                REQUESTED: false,
                SEARCHING: false,
                ACCEPTED: false,
                DRIVER_ARRIVING: false,
                DRIVER_WAITING: false,
                IN_PROGRESS: false,
                COMPLETED: false,
                CANCELLED: false
            };

    printStatus(
        database.connected,
        `ride_status_history ${
            database.connected
                ? `(${database.history} registros)`
                : ""
        }`
    );

    printStatus(
        historyStatuses.SEARCHING,
        "SEARCHING registrado"
    );

    printStatus(
        historyStatuses.ACCEPTED,
        "ACCEPTED registrado"
    );

    if (
        historyStatuses.DRIVER_ARRIVING
    ) {

        printStatus(
            true,
            "DRIVER_ARRIVING registrado"
        );

    } else {

        printPending(
            "DRIVER_ARRIVING pendiente"
        );
    }

    if (
        historyStatuses.DRIVER_WAITING
    ) {

        printStatus(
            true,
            "DRIVER_WAITING registrado"
        );

    } else {

        printPending(
            "DRIVER_WAITING pendiente"
        );
    }

    if (
        historyStatuses.IN_PROGRESS
    ) {

        printStatus(
            true,
            "IN_PROGRESS registrado"
        );

    } else {

        printPending(
            "IN_PROGRESS pendiente"
        );
    }

    if (
        historyStatuses.COMPLETED
    ) {

        printStatus(
            true,
            "COMPLETED registrado"
        );

    } else {

        printPending(
            "COMPLETED pendiente"
        );
    }

    if (
        historyStatuses.CANCELLED
    ) {

        printStatus(
            true,
            "CANCELLED registrado"
        );

    } else {

        printPending(
            "CANCELLED pendiente"
        );
    }

    // =====================================================
    // DAY 9 — AUTH
    // =====================================================

    console.log("");
    console.log(
        "🔐 DÍA 9 — AUTH"
    );

    const authRoutes =
        exists(
            "src/routes/auth.routes.js"
        );

    const authController =
        exists(
            "src/controllers/auth.controller.js"
        );

    const authMiddleware =
        exists(
            "src/middleware/auth.middleware.js"
        );

    const jwtImplementation =
        controllerContains(
            "src/controllers/auth.controller.js",
            "jwt.sign"
        );

    printStatus(
        authRoutes,
        "Auth routes"
    );

    printStatus(
        authController,
        "Auth controller"
    );

    printStatus(
        authMiddleware,
        "JWT middleware"
    );

    printStatus(
        jwtImplementation,
        "JWT token generation"
    );

    const authCompleted = [
        authRoutes,
        authController,
        authMiddleware,
        jwtImplementation
    ].filter(Boolean).length;

    const authTotal = 4;

    const authPercentage =
        printProgress(
            "   Progress",
            authCompleted,
            authTotal
        );

    // =====================================================
    // DAY 10 — MAPS / OSRM
    // =====================================================

    console.log("");
    console.log(
        "🗺️ DÍA 10 — MAPS / OSRM"
    );

    const mapsRoutes =
        exists(
            "src/routes/maps.routes.js"
        );

    const mapsController =
        exists(
            "src/controllers/maps.controller.js"
        );

    const routingService =
        exists(
            "src/services/routing.service.js"
        );

    if (
        mapsRoutes &&
        mapsController &&
        routingService
    ) {

        printStatus(
            true,
            "Maps / OSRM structure"
        );

    } else {

        printPending(
            "Maps / OSRM"
        );
    }

    // =====================================================
    // DAY 11 — WEBSOCKET
    // =====================================================

    console.log("");
    console.log(
        "📡 DÍA 11 — WEBSOCKET"
    );

    const websocketExists =
        exists("src/websocket");

    if (websocketExists) {

        printStatus(
            true,
            "WebSocket structure"
        );

    } else {

        printPending(
            "WebSocket"
        );
    }

    // =====================================================
    // CURRENT TASK
    // =====================================================

    console.log("");
    console.log(
        "🎯 CURRENT TASK"
    );

    if (!rideArriving) {

        console.log(
            "   PATCH /api/v1/rides/:id/arriving"
        );

        console.log(
            "   → ACCEPTED → DRIVER_ARRIVING"
        );

    } else if (!rideWaiting) {

        console.log(
            "   PATCH /api/v1/rides/:id/waiting"
        );

        console.log(
            "   → DRIVER_ARRIVING → DRIVER_WAITING"
        );

    } else if (!rideStart) {

        console.log(
            "   PATCH /api/v1/rides/:id/start"
        );

        console.log(
            "   → DRIVER_WAITING → IN_PROGRESS"
        );

    } else if (!rideComplete) {

        console.log(
            "   PATCH /api/v1/rides/:id/complete"
        );

        console.log(
            "   → IN_PROGRESS → COMPLETED"
        );

    } else if (!rideCancel) {

        console.log(
            "   PATCH /api/v1/rides/:id/cancel"
        );

        console.log(
            "   → Implementar cancelación"
        );

    } else {

        console.log(
            "   Ride lifecycle principal completado"
        );

        console.log(
            "   → Siguiente bloque: OSRM / WebSocket"
        );
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    console.log("");

    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
        "📊 PROJECT SUMMARY"
    );

    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
        `   Día 6 — Drivers API       ${driversPercentage}%`
    );

    console.log(
        `   Día 7 — Vehicles API      ${vehiclesPercentage}%`
    );

    console.log(
        `   Día 8 — Rides API         ${ridesPercentage}%`
    );

    console.log(
        `   Día 9 — Auth              ${authPercentage}%`
    );

    console.log(
        `   Database                  ${
            database.connected
                ? "ONLINE"
                : "OFFLINE"
        }`
    );

    console.log(
        `   API                       ${
            health.available
                ? "ONLINE"
                : "OFFLINE"
        }`
    );

    console.log(
        `   Git                       ${
            gitStatus === ""
                ? "CLEAN"
                : "CHANGES"
        }`
    );

    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log("");

    await pool.end();
}

// =========================================================
// ERROR HANDLER
// =========================================================

main().catch(
    async error => {

        console.error("");

        console.error(
            "❌ Error ejecutando project-status:",
            error.message
        );

        try {
            await pool.end();
        } catch {}

        process.exit(1);
    }
);