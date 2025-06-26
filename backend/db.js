const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection(process.env.DATABASE_URL);


connection.connect((err) => {
  if (err) {
    console.error('❌ MySQL connection failed:', err.message);
  } else {
    console.log('✅ Connected to MySQL');
  }
});

// Define addTodo function
const addTodo = (title, description) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO todos (title, description) VALUES (?, ?)';
    connection.query(query, [title, description], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve({ id: result.insertId, title, description });
    });
  });
};

// Export both connection and function
module.exports = {
  connection,
  addTodo,
};
