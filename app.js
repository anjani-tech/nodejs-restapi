const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
    console.log('Database is connected to app');
});

// Route to get all items
app.get('/api/items', (req, res) => {
    const query = 'SELECT * FROM items';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching items:', err);
            return res.status(500).json({ error: 'An error occurred while fetching items' });
        }
        res.json(results);
    });
});

// Route to create a new item
app.post('/api/items', (req, res) => {
    const { title, body } = req.body;
    if (!title || !body) {
        return res.status(400).json({ error: 'title and body are required' });
    }

    const query = 'INSERT INTO items (title, body) VALUES (?, ?)';
    connection.query(query, [title, body], (err, results) => {
        if (err) {
            console.error('Error adding item:', err);
            return res.status(500).json({ error: 'An error occurred while adding the item' });
        }
        res.status(201).json({ id: results.insertId, title, body });
    });
});

// Route to update an item
app.put('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;

    if (!title || !body) {
        return res.status(400).json({ error: 'title and body are required' });
    }

    const query = 'UPDATE items SET title = ?, body = ? WHERE id = ?';
    connection.query(query, [title, body, id], (err, results) => {
        if (err) {
            console.error('Error updating item:', err);
            return res.status(500).json({ error: 'An error occurred while updating the item' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ id, title, body });
    });
});

// Route to delete an item
app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;

    const query = 'DELETE FROM items WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error deleting item:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the item' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.status(204).send(); // No content
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
