// controllers/contactController.js
const connection = require('./db');
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");

// @desc Get all contacts (Admin Only)
// @route GET /api/contacts
// @access Admin Only
const getContacts = asyncHandler((req, res) => {
    if (!req.user.isAdmin) {
        res.status(403).json({ message: 'Forbidden: Admins only' });
        return;
    }
    const query = 'SELECT id, name, email, phone, created_at FROM contacts';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching contacts:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});

// @desc Create new contact
// @route POST /api/contacts
// @access Public
const createContact = asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
        res.status(400).json({ message: "All fields are mandatory!" });
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'INSERT INTO contacts (name, email, phone, password) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, email, phone, hashedPassword], (err, results) => {
        if (err) {
            console.error('Error creating contact:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(201).json({ message: 'Contact created', contactId: results.insertId });
    });
});

// @desc Get a contact by ID
// @route GET /api/contacts/:id
// @access Private (User or Admin)
const getContact = asyncHandler((req, res) => {
    const contactId = req.params.id;
    const query = 'SELECT * FROM contacts WHERE id = ?';
    connection.query(query, [contactId], (err, results) => {
        if (err) {
            console.error('Error fetching contact:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'Contact not found' });
            return;
        }

        const contact = results[0];
        if (req.user.userId !== contact.id && !req.user.isAdmin) {
            res.status(403).json({ message: "Forbidden: You do not have access to this contact" });
            return;
        }
        res.status(200).json(contact);
    });
});

// @desc Update a contact
// @route PUT /api/contacts/:id
// @access Private (User or Admin)
const updateContact = asyncHandler(async (req, res) => {
    const contactId = req.params.id;
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
        res.status(400).json({ message: "All fields are mandatory!" });
        return;
    }

    const query = 'SELECT * FROM contacts WHERE id = ?';
    connection.query(query, [contactId], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).json({ message: "Contact not found" });
            return;
        }

        const contact = results[0];
        if (req.user.userId !== contact.id && !req.user.isAdmin) {
            res.status(403).json({ message: "Forbidden: You do not have access to update this contact" });
            return;
        }

        const updateQuery = 'UPDATE contacts SET name = ?, email = ?, phone = ? WHERE id = ?';
        connection.query(updateQuery, [name, email, phone, contactId], (err, results) => {
            if (err) {
                console.error('Error updating contact:', err);
                res.status(500).json({ message: 'Internal server error' });
                return;
            }
            res.status(200).json({ message: 'Contact updated' });
        });
    });
});

// @desc Delete a contact
// @route DELETE /api/contacts/:id
// @access Private (User or Admin)
const deleteContact = asyncHandler((req, res) => {
    const contactId = req.params.id;

    const query = 'SELECT * FROM contacts WHERE id = ?';
    connection.query(query, [contactId], (err, results) => {
        if (err || results.length === 0) {
            res.status(404).json({ message: "Contact not found" });
            return;
        }

        const contact = results[0];
        if (req.user.userId !== contact.id && !req.user.isAdmin) {
            res.status(403).json({ message: "Forbidden: You do not have access to delete this contact" });
            return;
        }

        const deleteQuery = 'DELETE FROM contacts WHERE id = ?';
        connection.query(deleteQuery, [contactId], (err, results) => {
            if (err) {
                console.error('Error deleting contact:', err);
                res.status(500).json({ message: 'Internal server error' });
                return;
            }
            res.status(200).json({ message: 'Contact deleted' });
        });
    });
});

module.exports = {
    getContacts,
    createContact,
    getContact,
    updateContact,
    deleteContact,
};
