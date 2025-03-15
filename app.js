const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
const cors = require('cors');

// Connect to MongoDB
connectDB();

const app = express();

// Enable CORS for all origins
app.use(cors({
    origin: "http://192.168.18.29:3000", // Allows access from local website
    allowedHeaders: "Content-Type,Authorization",
    credentials: true
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// //Manually set CORS headers
// app.use((req, res, next) => {
//         res.header("Access-Control-Allow-Origin", "http://192.168.18.29:3000");
//         res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
//         res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
//         res.header("Access-Control-Allow-Credentials", "true");
//         next();
//     });

// Configure session
app.use(session({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false,
              httpOnly: true,
              sameSite: 'lax'  
     } // Set to `true` if using HTTPS
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
