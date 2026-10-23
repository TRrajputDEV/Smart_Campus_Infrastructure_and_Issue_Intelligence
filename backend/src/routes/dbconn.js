import { Pool } from 'pg';
import 'dotenv/config'; // This executes your custom config first

const { PGUSER, PGPASSWORD, PGDATABASE, PGHOST } = process.env;

const pool = new Pool({
    host: PGHOST,
    database: PGDATABASE,
    port: 5432,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: {
        rejectUnauthorized: false
    },
    keepalive: true 
});


pool.on('error', (error) => {
    console.error('Unexpected error on idle PostgreSQL client:', error.message);
});

const dbconn = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query("SELECT version();");
        console.log("Connection successful! Database version:", result.rows[0].version);
        const data = await client.query("SELECT * FROM departments;");
        console.log(data);
        
        client.release(); 
    } catch (error) {
        console.log(`Database connection test failed: ${error.message}`);
    }
};

export default dbconn;
