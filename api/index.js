const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("../config/db");

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Connect DB on cold start
connectDB().catch((err) => {
    console.error("DB connection error:", err);
    process.exit(1);
});

// Routes
app.use("/api/auth", require("../routes/auth"));
app.use("/api/meals", require("../routes/meals"));
app.use("/api/poops", require("../routes/poops"));

// Health check
app.get("/", (req, res) => {
    res.send("GutCheck API is running on Vercel 🚀");
});

// Error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ message: "An unexpected error occurred" });
});

module.exports = app;
