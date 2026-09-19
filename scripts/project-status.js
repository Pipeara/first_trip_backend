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
        .replace(/;/g, "; ");

    const patterns = [
        `router.${method}("${route}")`,
        `router.${method}('${route}')`,
        `router.${method}("${route}"`,
        `router.${method}('${route}'`,
        `router.${method} ( "${route}" )`,
        `router.${method} ( '${route}' )`
    ];

    return patterns.some(
        pattern => normalized.includes(pattern)
    );
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
        rides: 0
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

    } catch (error) {

        console.error(
            `❌ Database error: ${error.message}`
        );
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
        "╔════════════════════════════════════════════════════╗"
    );
    console.log(
        "║             🚗 FIRST TRIP PROJECT BOARD            ║"
    );
    console.log(
        "╚════════════════════════════════════════════════════╝"
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

    // GET /drivers
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

    // GET /drivers/:id
    printStatus(
        driverGetById,
        "GET /api/v1/drivers/:id"
    );

    // POST /drivers
    printStatus(
        driverPost,
        "POST /api/v1/drivers"
    );

    // PATCH /drivers/:id/status
    if (
        driverPatch &&
        driverStatusController
    ) {

        printStatus(
            true,
            "PATCH /api/v1/drivers/:id/status"
        );

    } else {

        printPending(
            "PATCH /api/v1/drivers/:id/status"
        );
    }

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

    const vehiclesExists =
        exists(vehiclesRoutes) &&
        exists(vehiclesController);

    if (vehiclesExists) {

        printStatus(
            true,
            "Vehicles API structure"
        );

    } else {

        printPending(
            "Vehicles API"
        );
    }

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

    if (ridePost) {

        printStatus(
            true,
            "POST /api/v1/rides"
        );

    } else {

        printPending(
            "POST /api/v1/rides"
        );
    }

    if (rideGetById) {

        printStatus(
            true,
            "GET /api/v1/rides/:id"
        );

    } else {

        printPending(
            "GET /api/v1/rides/:id"
        );
    }

    printStatus(
        exists(ridesController),
        "Rides controller"
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

    if (
        authRoutes &&
        authController
    ) {

        printStatus(
            true,
            "Auth structure"
        );

    } else {

        printPending(
            "Authentication"
        );
    }

    // =====================================================
    // DAY 10 — MAPS
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

    if (
        exists("src/websocket")
    ) {

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

    if (
        driversPercentage < 100
    ) {

        console.log(
            "   PATCH /api/v1/drivers/:id/status"
        );

        console.log(
            "   → Completar Día 6"
        );

    } else if (
        !vehiclesExists
    ) {

        console.log(
            "   DÍA 7 — Vehicles API"
        );

        console.log(
            "   → Crear vehicles.controller.js"
        );

    } else {

        console.log(
            "   Revisar siguiente bloque del roadmap"
        );
    }

    // =====================================================
    // SUMMARY
    // =====================================================

    console.log("");

    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
        "📊 PROJECT SUMMARY"
    );

    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );

    console.log(
        `   Día 6 — Drivers API       ${driversPercentage}%`
    );

    console.log(
        `   Database                 ${
            database.connected
                ? "ONLINE"
                : "OFFLINE"
        }`
    );

    console.log(
        `   API                      ${
            health.available
                ? "ONLINE"
                : "OFFLINE"
        }`
    );

    console.log(
        `   Git                      ${
            gitStatus === ""
                ? "CLEAN"
                : "CHANGES"
        }`
    );

    console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
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