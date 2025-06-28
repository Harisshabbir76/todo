const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

// Create a connection pool with configuration
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds
  acquireTimeout: 10000  // 10 seconds
});

// Create promise wrapper for the pool
const promisePool = pool.promise();

// Test the database connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL database');
    connection.release();
  }
});

// Event listeners for the pool
pool.on('connection', (connection) => {
  console.log('New MySQL connection established');
});

pool.on('error', (err) => {
  console.error('MySQL pool error:', err);
});

// AddTodo function using the pool
const addTodo = async (title, description) => {
  try {
    const [result] = await promisePool.query(
      'INSERT INTO todos (title, description) VALUES (?, ?)',
      [title, description]
    );
    return { id: result.insertId, title, description };
  } catch (error) {
    console.error('Error adding todo:', error);
    throw error;
  }
};

module.exports = {
  pool,
  promisePool,
  addTodo
};