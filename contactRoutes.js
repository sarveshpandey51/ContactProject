const express = require("express");
const router = express.Router();
const { 
    getContacts,
    createContact,
    getContact,
    updateContact,
    deleteContact,
 } = require("../controllers/contactController");

// router.route("/").get(getContacts).post(createContact);
router.get(('/'),getContacts);
router.post(('/'), createContact);
router.get(('/:id'),getContact);
router.put(("/:id"), updateContact );
router.delete(("/:id"),deleteContact);

module.exports = router;