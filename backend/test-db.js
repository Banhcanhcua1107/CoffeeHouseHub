require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT
        });

        console.log("✅ Kết nối thành công tới Railway DB!");

        const [rows] = await conn.query("SHOW TABLES");
        console.log("Tables:", rows);

        await conn.end();
    } catch (err) {
        console.error("❌ Kết nối DB thất bại:", err.message);
    }
}

testConnection();
