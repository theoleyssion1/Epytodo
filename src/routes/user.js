const express = require("express");
const db = require("../config/db");
const authMiddleware = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const router = express.Router();

router.get("/user", authMiddleware, async (request, response) => {
    try {
        db.query('SELECT * FROM user WHERE id = ?', [request.user.id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            if (results.length === 0) return response.status(404).json({ msg: "User not found" });
            return response.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

router.get("/user/todos", authMiddleware, (request, response) => {
    try {
        db.query('SELECT * FROM todo WHERE user_id = ?', [request.user.id], (error, results) => {
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

router.get("/users/:id", authMiddleware, (request, response) => {
    const { id } = request.params;
    try {
        db.query('SELECT * FROM user WHERE id = ? OR email = ?', [id, id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            if (results.length === 0) return response.status(404).json({ msg: "User not found" });
            return response.status(200).json(results[0]);
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

router.put("/users/:id", authMiddleware, async (request, response) => {
    const { email, password, name, firstname } = request.body;
    const { id } = request.params;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('SELECT * FROM user WHERE id = ?', [id], (error, results) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            if (results.length === 0) {
                return response.status(404).json({ msg: "User not found" });
            }

            const created_at = results[0].created_at;

            db.query(
                'UPDATE user SET email = ?, password = ?, name = ?, firstname = ? WHERE id = ?',
                [email, hashedPassword, name, firstname, id],
                (error, results) => {
                    if (error) {
                        console.error('Database error:', error);
                        return response.status(500).json({ msg: 'Internal server error' });
                    }
                    if (results.affectedRows === 0) {
                        return response.status(404).json({ msg: "User not found" });
                    }

                    return response.status(200).json({
                        id: id,
                        email,
                        name,
                        firstname,
                        password: hashedPassword,
                        created_at: created_at
                    });
                }
            );
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

router.delete("/users/:id", authMiddleware, (request, response) => {
    const { id } = request.params;
    try {
        db.query('DELETE FROM todo WHERE user_id = ?', [id], (error, todoResults) => {
            if (error) {
                console.error('Database error:', error);
                return response.status(500).json({ msg: 'Internal server error' });
            }
            db.query('DELETE FROM user WHERE id = ?', [id], (error, userResults) => {
                if (error) {
                    console.error('Database error:', error);
                    return response.status(500).json({ msg: 'Internal server error' });
                }
                if (userResults.affectedRows === 0) {
                    return response.status(404).json({ msg: "User not found" });
                }
                return response.status(200).json({ msg: `Successfully deleted user and associated todos for user ID: ${id}` });
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        return response.status(500).json({ msg: 'Internal server error' });
    }
});

module.exports = router;