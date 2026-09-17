import { pool } from "../src/config/db.js";

try {
    const result = await pool.query(
        "SELECT current_database(), current_user"
    );

    console.log("✅ PostgreSQL conectado");
    console.log(result.rows[0]);
} catch (error) {
    console.error("❌ Error de conexión:");
    console.error(error.message);
} finally {
    await pool.end();
}