const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Enhanced connection pool configuration
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 20, // Increased from 10
  queueLimit: 0,
  connectTimeout: 30000, // 30 seconds
  acquireTimeout: 30000, // 30 seconds
  idleTimeout: 600000, // 10 minutes
  enableKeepAlive: true, // Important for long-running apps
  keepAliveInitialDelay: 10000 // 10 seconds
});

// Promisified pool
const promisePool = pool.promise();

// Connection test with retry logic
const testConnection = async (attempts = 3) => {
  for (let i = 0; i < attempts; i++) {
    try {
      const connection = await promisePool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✅ Connected to MySQL database');
      return true;
    } catch (err) {
      console.error(`❌ Connection attempt ${i + 1} failed:`, err.message);
      if (i < attempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }
  throw new Error('Failed to establish database connection after multiple attempts');
};

// Initialize connection
testConnection().catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});

// Event listeners
pool.on('connection', (connection) => {
  console.log('New MySQL connection established');
});

pool.on('error', (err) => {
  console.error('MySQL pool error:', err);
});

pool.on('acquire', (connection) => {
  console.log('Connection %d acquired', connection.threadId);
});

pool.on('release', (connection) => {
  console.log('Connection %d released', connection.threadId);
});

// AddTodo function with enhanced error handling
const addTodo = async (title, description) => {
  let connection;
  try {
    connection = await promisePool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title, description]
    );
    return { id: result.insertId, title, description };
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  pool,
  promisePool,
  addTodo,
  testConnection
};