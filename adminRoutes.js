// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const connection = require("../controllers/db");
const asyncHandler = require("express-async-handler");

// Admin-only route to get all users
router.get("/users", asyncHandler((req, res) => {
    const query = 'SELECT id, name, email, phone, created_at FROM contacts';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
}));

// Admin-only route to delete a user
router.delete("/user/:id", asyncHandler((req, res) => {
    const userId = req.params.id;
    const query = 'DELETE FROM contacts WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err || results.affectedRows === 0) {
            res.status(404).json({ message: "User not found or error deleting user" });
            return;
        }
        res.status(200).json({ message: "User deleted" });
    });
}));

module.exports = router;
