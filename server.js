// server.js
const express = require("express");
const errorHandler = require("./middleware/errorHandler");
const dotenv = require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;
const { authMiddleware, adminMiddleware } = require("./middleware/authMiddleware");


// Middleware to log request bodies
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}`);
    console.log(`Request URL: ${req.url}`);
    console.log("Request Body:", req.body); // Log request body to the terminal
    next(); // Pass to the next middleware/route handler
});

app.use(express.json());
app.use("/api/contacts", authMiddleware, require("./routes/contactRoutes")); // used to set up middleware for your application.
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", authMiddleware, adminMiddleware, require("./routes/adminRoutes"));

app.use(errorHandler);

app.listen(port, () => {
    console.log(`server running on port : ${port}`);
});
