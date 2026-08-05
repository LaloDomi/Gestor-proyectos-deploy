const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

const poolPromise = pool
  .connect()
  .then((client) => {
    console.log("✅ Conectado a Supabase PostgreSQL");
    client.release();
    return pool;
  });

module.exports = {
  pool,
  poolPromise,
};