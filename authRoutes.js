// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const connection = require("../controllers/db");
const asyncHandler = require("express-async-handler");

// Register a new user
router.post("/register", asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
        res.status(400).json({ message: "All fields are mandatory!" });
        return;
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO contacts (name, email, phone, password) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, email, phone, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error registering user:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(201).json({ message: 'User registered successfully' });
    });
}));

// Login user
router.post("/login", asyncHandler(async (req, res) => {
    const { email, password } = req.body; // retriving data from body
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required!" });
        return;
    }

    const query = 'SELECT * FROM contacts WHERE email = ?';
    connection.query(query, [email], async (err, results) => {
        if (err || results.length === 0) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const user = results[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }

        const isAdmin = user.name === 'admin' && user.email === 'admin@gmail.com' && password === 'admin_123';
        const token = jwt.sign({ userId: user.id, isAdmin }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ message: "Login successful", token, isAdmin });
    });
}));

module.exports = router;
