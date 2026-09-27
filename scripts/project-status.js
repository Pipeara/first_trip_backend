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
        history: 0,
        driverLocations: 0
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

        const driverLocationsResult =
            await pool.query(`
                SELECT COUNT(*)::int AS count
                FROM driver_locations
            `);

        result.driverLocations =
            driverLocationsResult.rows[0].count;

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
// DAY 14 — REALTIME RIDE STATUS DETECTION
// =========================================================

function broadcastTransitionContains(
    controllerContent,
    previousStatus,
    nextStatus
) {
    const matches =
        controllerContent.match(
            /broadcastRideStatusChanged\s*\(\s*\{([\s\S]*?)\}\s*\);/g
        ) || [];

    return matches.some(
        block =>
            block.includes(
                `previousStatus: "${previousStatus}"`
            ) &&
            block.includes(
                `status: "${nextStatus}"`
            )
    );
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

        console.log(
            `   Driver locations       ${database.driverLocations}`
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

    printStatus(
        rideArriving,
        "PATCH /api/v1/rides/:id/arriving"
    );

    printStatus(
        rideWaiting,
        "PATCH /api/v1/rides/:id/waiting"
    );

    printStatus(
        rideStart,
        "PATCH /api/v1/rides/:id/start"
    );

    printStatus(
        rideComplete,
        "PATCH /api/v1/rides/:id/complete"
    );

    printStatus(
        rideCancel,
        "PATCH /api/v1/rides/:id/cancel"
    );

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

    printStatus(
        rideArriving,
        "ACCEPTED → DRIVER_ARRIVING"
    );

    printStatus(
        rideWaiting,
        "DRIVER_ARRIVING → DRIVER_WAITING"
    );

    printStatus(
        rideStart,
        "DRIVER_WAITING → IN_PROGRESS"
    );

    printStatus(
        rideComplete,
        "IN_PROGRESS → COMPLETED"
    );

    printStatus(
        rideCancel,
        "Cancellation"
    );

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
        historyStatuses.REQUESTED,
        "REQUESTED registrado"
    );

    printStatus(
        historyStatuses.SEARCHING,
        "SEARCHING registrado"
    );

    printStatus(
        historyStatuses.ACCEPTED,
        "ACCEPTED registrado"
    );

    printStatus(
        historyStatuses.DRIVER_ARRIVING,
        "DRIVER_ARRIVING registrado"
    );

    printStatus(
        historyStatuses.DRIVER_WAITING,
        "DRIVER_WAITING registrado"
    );

    printStatus(
        historyStatuses.IN_PROGRESS,
        "IN_PROGRESS registrado"
    );

    printStatus(
        historyStatuses.COMPLETED,
        "COMPLETED registrado"
    );

    printStatus(
        historyStatuses.CANCELLED,
        "CANCELLED registrado"
    );

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

    const mapsRoute =
        routeContains(
            "src/routes/maps.routes.js",
            "post",
            "/route"
        );

    const mapsControllerHandler =
        controllerContains(
            "src/controllers/maps.controller.js",
            "getRoute"
        );

    const osrmImplementation =
        controllerContains(
            "src/services/routing.service.js",
            "router.project-osrm.org"
        );

    const mapsFeatures = [
        mapsRoutes,
        mapsController,
        routingService,
        mapsRoute,
        mapsControllerHandler,
        osrmImplementation
    ];

    const mapsCompleted =
        mapsFeatures.filter(Boolean).length;

    const mapsTotal =
        mapsFeatures.length;

    printStatus(
        mapsRoutes,
        "Maps routes"
    );

    printStatus(
        mapsController,
        "Maps controller"
    );

    printStatus(
        routingService,
        "Routing service"
    );

    printStatus(
        mapsRoute,
        "POST /api/v1/maps/route"
    );

    printStatus(
        mapsControllerHandler,
        "Route controller handler"
    );

    printStatus(
        osrmImplementation,
        "OSRM routing"
    );

    const mapsPercentage =
        printProgress(
            "   Progress",
            mapsCompleted,
            mapsTotal
        );

    // =====================================================
    // DAY 11 — WEBSOCKET FOUNDATION
    // =====================================================

    console.log("");
    console.log(
        "📡 DÍA 11 — WEBSOCKET FOUNDATION"
    );

    const websocketServer =
        exists(
            "src/websocket/websocket.server.js"
        );

    const websocketClients =
        exists(
            "src/websocket/websocket.clients.js"
        );

    const websocketEvents =
        exists(
            "src/websocket/websocket.events.js"
        );

    const websocketInitialization =
        controllerContains(
            "src/websocket/websocket.server.js",
            "new WebSocketServer"
        );

    const websocketPath =
        controllerContains(
            "src/websocket/websocket.server.js",
            'path: "/ws"'
        );

    const websocketFoundationFeatures = [
        websocketServer,
        websocketClients,
        websocketEvents,
        websocketInitialization,
        websocketPath
    ];

    const websocketFoundationCompleted =
        websocketFoundationFeatures
            .filter(Boolean)
            .length;

    const websocketFoundationTotal =
        websocketFoundationFeatures.length;

    printStatus(
        websocketServer,
        "WebSocket server"
    );

    printStatus(
        websocketClients,
        "WebSocket clients"
    );

    printStatus(
        websocketEvents,
        "WebSocket events"
    );

    printStatus(
        websocketInitialization,
        "WebSocketServer initialization"
    );

    printStatus(
        websocketPath,
        "WebSocket path /ws"
    );

    const websocketFoundationPercentage =
        printProgress(
            "   Progress",
            websocketFoundationCompleted,
            websocketFoundationTotal
        );

    // =====================================================
    // DAY 12 — WEBSOCKET + RIDES
    // =====================================================

    console.log("");
    console.log(
        "🔄 DÍA 12 — WEBSOCKET + RIDES"
    );

    const rideJoin =
        controllerContains(
            "src/websocket/websocket.events.js",
            '"ride.join"'
        );

    const rideLeave =
        controllerContains(
            "src/websocket/websocket.events.js",
            '"ride.leave"'
        );

    const rideJoinedEvent =
        controllerContains(
            "src/websocket/websocket.events.js",
            '"ride.joined"'
        );

    const rideLeftEvent =
        controllerContains(
            "src/websocket/websocket.events.js",
            '"ride.left"'
        );

    const disconnectCleanup =
        controllerContains(
            "src/websocket/websocket.events.js",
            "handleWebSocketDisconnect"
        ) &&
        controllerContains(
            "src/websocket/websocket.events.js",
            "removeClientFromRide"
        );

    const broadcastImplementation =
        controllerContains(
            "src/websocket/websocket.clients.js",
            "broadcastToRide"
        );

    const websocketRideFeatures = [
        rideJoin,
        rideLeave,
        rideJoinedEvent,
        rideLeftEvent,
        disconnectCleanup,
        broadcastImplementation
    ];

    const websocketRideCompleted =
        websocketRideFeatures.filter(Boolean).length;

    const websocketRideTotal =
        websocketRideFeatures.length;

    printStatus(
        rideJoin,
        "ride.join"
    );

    printStatus(
        rideJoinedEvent,
        "ride.joined"
    );

    printStatus(
        rideLeave,
        "ride.leave"
    );

    printStatus(
        rideLeftEvent,
        "ride.left"
    );

    printStatus(
        disconnectCleanup,
        "Disconnect cleanup"
    );

    printStatus(
        broadcastImplementation,
        "broadcastToRide"
    );

    const websocketRidePercentage =
        printProgress(
            "   Progress",
            websocketRideCompleted,
            websocketRideTotal
        );

    // =====================================================
    // DAY 13 — DRIVER LOCATION
    // =====================================================

    console.log("");
    console.log(
        "📍 DÍA 13 — DRIVER LOCATION"
    );

    const driverLocationService =
        exists(
            "src/services/driver-location.service.js"
        );

    const driverLocationTable =
        database.connected &&
        database.driverLocations >= 0;

    const driverLocationEvent =
        controllerContains(
            "src/websocket/websocket.events.js",
            '"driver.location_updated"'
        );

    const locationValidation =
        controllerContains(
            "src/websocket/websocket.events.js",
            "Number.isFinite(latitude)"
        ) &&
        controllerContains(
            "src/websocket/websocket.events.js",
            "Number.isFinite(longitude)"
        );

    const locationPersistence =
        controllerContains(
            "src/websocket/websocket.events.js",
            "saveDriverLocation"
        );

    const locationBroadcast =
        controllerContains(
            "src/websocket/websocket.events.js",
            "broadcastToRide"
        );

    const driverLocationFeatures = [
        driverLocationService,
        driverLocationTable,
        driverLocationEvent,
        locationValidation,
        locationPersistence,
        locationBroadcast
    ];

    const driverLocationCompleted =
        driverLocationFeatures.filter(Boolean).length;

    const driverLocationTotal =
        driverLocationFeatures.length;

    printStatus(
        driverLocationService,
        "Driver location service"
    );

    printStatus(
        driverLocationTable,
        `driver_locations ${
            database.connected
                ? `(${database.driverLocations} registros)`
                : ""
        }`
    );

    printStatus(
        driverLocationEvent,
        "driver.location_updated"
    );

    printStatus(
        locationValidation,
        "Latitude / longitude validation"
    );

    printStatus(
        locationPersistence,
        "Persistencia en PostgreSQL"
    );

    printStatus(
        locationBroadcast,
        "Broadcast al Ride"
    );

    const driverLocationPercentage =
        printProgress(
            "   Progress",
            driverLocationCompleted,
            driverLocationTotal
        );

    // =====================================================
    // DAY 14 — REALTIME RIDE STATUS
    // =====================================================

    console.log("");
    console.log(
        "📡 DÍA 14 — REALTIME RIDE STATUS"
    );

    const ridesControllerContent =
        read("src/controllers/rides.controller.js");

    const rideStatusChangedEvent =
        ridesControllerContent.includes(
            'type: "ride.status_changed"'
        );

    const acceptedToArriving =
        broadcastTransitionContains(
            ridesControllerContent,
            "ACCEPTED",
            "DRIVER_ARRIVING"
        );

    const arrivingToWaiting =
        broadcastTransitionContains(
            ridesControllerContent,
            "DRIVER_ARRIVING",
            "DRIVER_WAITING"
        );

    const waitingToInProgress =
        broadcastTransitionContains(
            ridesControllerContent,
            "DRIVER_WAITING",
            "IN_PROGRESS"
        );

    const inProgressToCompleted =
        broadcastTransitionContains(
            ridesControllerContent,
            "IN_PROGRESS",
            "COMPLETED"
        );

    printStatus(
        rideStatusChangedEvent,
        "ride.status_changed"
    );

    printStatus(
        acceptedToArriving,
        "Integrar ACCEPTED → DRIVER_ARRIVING"
    );

    printStatus(
        arrivingToWaiting,
        "Integrar DRIVER_ARRIVING → DRIVER_WAITING"
    );

    printStatus(
        waitingToInProgress,
        "Integrar DRIVER_WAITING → IN_PROGRESS"
    );

    printStatus(
        inProgressToCompleted,
        "Integrar IN_PROGRESS → COMPLETED"
    );

    const realtimeStatusFeatures = [
        rideStatusChangedEvent,
        acceptedToArriving,
        arrivingToWaiting,
        waitingToInProgress,
        inProgressToCompleted
    ];

    const realtimeStatusCompleted =
        realtimeStatusFeatures.filter(Boolean).length;

    const realtimeStatusTotal =
        realtimeStatusFeatures.length;

    const realtimeStatusPercentage =
        printProgress(
            "   Progress",
            realtimeStatusCompleted,
            realtimeStatusTotal
        );

    // =====================================================
    // CURRENT TASK
    // =====================================================

    console.log("");
    console.log(
        "🎯 CURRENT TASK"
    );

    if (
        realtimeStatusPercentage === 100
    ) {

        console.log(
            "   Realtime de estados del Ride integrado"
        );

        console.log(
            "   → ride.status_changed"
        );

        console.log(
            "   → Día 14 — Realtime Ride Status ✅"
        );

    } else {

        console.log(
            "   Completar realtime de estados del Ride"
        );

        console.log(
            "   → Día 14 — Realtime Ride Status"
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
        `   Día 10 — Maps / OSRM      ${mapsPercentage}%`
    );

    console.log(
        `   Día 11 — WebSocket        ${websocketFoundationPercentage}%`
    );

    console.log(
        `   Día 12 — WS + Rides       ${websocketRidePercentage}%`
    );

    console.log(
        `   Día 13 — Driver Location  ${driverLocationPercentage}%`
    );

    console.log(
        `   Día 14 — Ride Status      ${realtimeStatusPercentage}%`
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