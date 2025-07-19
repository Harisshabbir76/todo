const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const db = require('./db');

dotenv.config();

const app = express();

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://51.20.108.227:3000',
  'https://todo-eta-swart-73.vercel.app',
  'http://16.171.197.202:5000/' // Add this line
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is in the allowed list or contains the EC2 IP
    if (
      allowedOrigins.includes(origin) || 
      origin.includes('51.20.108.227') // Allow any port from this IP
    ) {
      console.log(`✅ CORS allowed: ${origin}`);
      return callback(null, true);
    } else {
      console.log(`❌ CORS blocked: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection health middleware
app.use(async (req, res, next) => {
  try {
    await db.testConnection();
    next();
  } catch (err) {
    console.error('Database connection check failed:', err);
    return res.status(503).json({ 
      error: 'Service temporarily unavailable',
      message: 'Database connection failed'
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const [result] = await db.promisePool.query('SELECT 1');
    res.status(200).json({ 
      status: 'OK',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'Service Unavailable',
      database: 'Disconnected',
      error: err.message
    });
  }
});


// Updated logout endpoint in server.js
app.post('/logout', (req, res) => {
  try {
    // Clear any authentication tokens or cookies
    res.clearCookie('auth_token');
    
    // Send proper response
    res.status(200).json({ 
      success: true,
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Logout failed' 
    });
  }
});

// User Registration
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  let connection;
  
  try {
    connection = await db.promisePool.getConnection();
    
    // Check if user already exists
    const [users] = await connection.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await connection.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    if (connection) connection.release();
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  let connection;
  
  try {
    connection = await db.promisePool.getConnection();
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.status(200).json({ 
      message: 'Login successful', 
      userId: user.id,
      username: user.username 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    if (connection) connection.release();
  }
});

// Todo Routes
app.post('/add-todo', async (req, res) => {
  const { title, description = '', userId = null } = req.body;
  let connection;
  
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    connection = await db.promisePool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)',
      [title, description, userId]
    );
    
    res.status(201).json({ 
      message: 'Todo added successfully',
      todoId: result.insertId
    });
  } catch (error) {
    console.error('Add todo error:', error);
    res.status(500).json({ error: 'Failed to add todo' });
  } finally {
    if (connection) connection.release();
  }
});

app.get('/all/todos', async (req, res) => {
  const userId = req.query.userId;
  let connection;
  
  try {
    connection = await db.promisePool.getConnection();
    let rows;
    
    if (userId) {
      [rows] = await connection.query(
        'SELECT id, title, description, is_completed AS isCompleted FROM todos WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    } else {
      [rows] = await connection.query(
        `SELECT id, title, description, is_completed AS isCompleted FROM todos 
         WHERE user_id IS NULL 
         AND created_at > NOW() - INTERVAL 10 HOUR 
         ORDER BY created_at DESC`
      );
    }
    
    const processedRows = rows.map(row => ({
      ...row,
      is_completed: Boolean(row.isCompleted)
    }));
    
    res.status(200).json(processedRows);
  } catch (error) {
    console.error('Fetch todos error:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/cleanup-guests', async (req, res) => {
  let connection;
  
  try {
    connection = await db.promisePool.getConnection();
    const [result] = await connection.query(
      'DELETE FROM todos WHERE user_id IS NULL AND created_at < NOW() - INTERVAL 10 HOUR'
    );
    
    res.status(200).json({ 
      message: 'Old guest tasks removed successfully',
      deletedCount: result.affectedRows
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  } finally {
    if (connection) connection.release();
  }
});

app.delete('/delete-todo/:id', async (req, res) => {
  const { id } = req.params;
  let connection;
  
  try {
    connection = await db.promisePool.getConnection();
    const [result] = await connection.query(
      'DELETE FROM todos WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json({ 
      message: 'Todo deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Failed to delete todo' });
  } finally {
    if (connection) connection.release();
  }
});

app.put('/edit-todo/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  let connection;
  
  try {
    connection = await db.promisePool.getConnection();
    const [result] = await connection.query(
      'UPDATE todos SET title = ?, description = ? WHERE id = ?',
      [title, description, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json({ 
      message: 'Todo updated successfully',
      updatedId: id
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Failed to update todo' });
  } finally {
    if (connection) connection.release();
  }
});

app.patch('/toggle-todo/:id', async (req, res) => {
  const { id } = req.params;
  const { isCompleted } = req.body;
  let connection;
  
  try {
    connection = await db.promisePool.getConnection();
    const [result] = await connection.query(
      'UPDATE todos SET is_completed = ? WHERE id = ?',
      [isCompleted, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.status(200).json({ 
      message: 'Todo status updated',
      todoId: id,
      newStatus: isCompleted
    });
  } catch (error) {
    console.error('Toggle todo error:', error);
    res.status(500).json({ error: 'Failed to update todo status' });
  } finally {
    if (connection) connection.release();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Starting graceful shutdown...');
  
  try {
    // Close the database pool
    await db.pool.end();
    console.log('Database pool closed');
    
    // Close the server
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
    
    // Force shutdown after timeout
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start the server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  // Consider whether to shut down here
});