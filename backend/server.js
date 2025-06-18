const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend origin
  credentials: true // Allow credentials
}));

app.use(express.json());




app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    await db.connection.promise().query(query, [username, email, hashedPassword]);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Signup failed' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await db.connection.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({ 
      message: 'Login successful', 
      userId: user.id,
      username: user.username 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});


app.post('/logout', (req, res) => {
  
  res.clearCookie('yourCookieName');
  res.status(200).json({ message: 'Logged out successfully' });
});




app.post('/add-todo', async (req, res) => {
  const { title, description = '', userId = null } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const query = 'INSERT INTO todos (title, description, user_id) VALUES (?, ?, ?)';
    await db.connection.promise().query(query, [title, description, userId]);
    res.status(201).json({ message: 'Todo added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

app.get('/all/todos', async (req, res) => {
  const userId = req.query.userId;
  try {
    let rows;
    if (userId) {
      [rows] = await db.connection.promise().query(
        'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    } else {
      [rows] = await db.connection.promise().query(
        `SELECT * FROM todos 
         WHERE user_id IS NULL 
         AND created_at > NOW() - INTERVAL 10 HOUR 
         ORDER BY created_at DESC`
      );
    }
    res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.delete('/cleanup-guests', async (req, res) => {
  try {
    await db.connection.promise().query(
      'DELETE FROM todos WHERE user_id IS NULL AND created_at < NOW() - INTERVAL 10 HOUR'
    );
    res.status(200).json({ message: 'Old guest tasks removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});



app.delete('/delete-todo/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM todos WHERE id = ?';
    await db.connection.promise().query(query, [id]);
    res.status(200).json({ message: 'Todo deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});


app.put('/edit-todo/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  try {
    const query = 'UPDATE todos SET title = ?, description = ? WHERE id = ?';
    await db.connection.promise().query(query, [title, description, id]);
    res.status(200).json({ message: 'Todo updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});



app.patch('/toggle-todo/:id', async (req, res) => {
  const { id } = req.params;
  const { isCompleted } = req.body;

  try {
    const query = 'UPDATE todos SET is_completed = ? WHERE id = ?';
    await db.connection.promise().query(query, [isCompleted, id]);
    res.status(200).json({ message: 'Todo status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update todo status' });
  }
});










const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
