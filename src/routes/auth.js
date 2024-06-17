const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
    const { email, password, name, firstname } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    if (!email || !password || !name || !firstname)
        return res.status(400).json({ msg: 'Please provide required fields' });

    try {
        const addUserQuery = "INSERT INTO user (email, password, name, firstname) VALUES (?,?,?,?)";
        db.query(addUserQuery, [email, hashedPassword, name, firstname], (err, result) => {
            if (err) return res.status(409).json({ msg: "Account already exists" });

            const token = jwt.sign({ id: result.insertId }, process.env.SECRET, { expiresIn: "1h" });
            res.status(201).json({ token });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(401).json({ msg: 'Please provide email and password' });

    try {
        const loginQuery = "SELECT * FROM user WHERE email = ?";
        db.query(loginQuery, [email], async (err, results) => {
            if (err) return res.status(500).json({ msg: 'Database error', error: err });
            if (results.length === 0) return res.status(401).json({ msg: "Invalid Credentials" });

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ msg: "Invalid Credentials" });

            const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: '1h' });
            res.status(200).json({ token });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ msg: 'Internal server error', error });
    }
});

module.exports = router;
