const express = require("express");
const authMiddleware = require("../middleware/auth");
const db = require("../config/db");
const router = express.Router();

router.get("/todos", authMiddleware, (request, response) => {
    try {
        db.query('SELECT * FROM todo', (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            if (results.length === 0) return response.status(404).json({ msg: "No todos found" });
            return response.status(200).json(results);
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

router.get("/todos/:id", authMiddleware, (request, response) => {
    const { id } = request.params;
    try {
        db.query('SELECT * FROM todo WHERE id = ?', [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            if (results.length === 0) return response.status(404).json({ msg: "Todo not found" });
            return response.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

router.post("/todos", authMiddleware, (request, response) => {
    const { title, description, due_time, user_id, status } = request.body;
    if (!title || !description || !due_time || !user_id || !status) {
        return response.status(400).json({ msg: "Bad parameter" });
    }
    try {
        const addTodoQuery = "INSERT INTO todo (title, description, due_time, user_id, status) VALUES (?, ?, ?, ?, ?)";
        db.query(addTodoQuery, [title, description, due_time, user_id, status], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            response.status(201).json({ id: result.insertId, title, description, due_time, user_id, status });
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

router.put("/todos/:id", authMiddleware, (request, response) => {
    const { title, description, due_time, user_id, status } = request.body;
    const { id } = request.params;
    try {
        const updateTodoQuery = 'UPDATE todo SET title = ?, description = ?, due_time = ?, user_id = ?, status = ? WHERE id = ?';
        db.query(updateTodoQuery, [title, description, due_time, user_id, status, id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            if (results.affectedRows === 0) return response.status(404).json({ msg: "Todo not found" });
            return response.status(200).json({ title, description, due_time, user_id, status});
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

router.delete("/todos/:id", authMiddleware, (request, response) => {
    const { id } = request.params;
    try {
        const deleteTodoQuery = 'DELETE FROM todo WHERE id = ?';
        db.query(deleteTodoQuery, [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            if (results.affectedRows === 0) return response.status(404).json({ msg: "Todo not found" });
            return response.status(200).json({ msg: `Successfully deleted record number: ${id}` });
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;
