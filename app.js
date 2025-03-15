const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const cors = require('cors');

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS for all origins
app.use(cors({
    origin: "http://localhost:3000", // Allows access from local website
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to `true` if using HTTPS
}));

// Import and use auth routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Test Route
app.get("/api/welcome", (req, res) => {
    res.status(200).send("Welcome!");
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
