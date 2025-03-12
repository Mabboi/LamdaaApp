const mongoose = require('mongoose');
const User = require('../models/User'); // Import the User model

const MONGO_URI = "mongodb+srv://bwemana:08035153933@cluster0.uzw8e.mongodb.net";

const connectDB = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            authSource: "admin"
        });
        console.log('MongoDB Connected Successfully');
        // Create the empty User collection
        await User.createCollection();
        console.log('User collection created successfully');
    } catch (err) {
        console.error('MongoDB Connection Failed:', err.message);
        process.exit(1); // Exit the process with failure
    }
};

connectDB();

module.exports = connectDB;
 