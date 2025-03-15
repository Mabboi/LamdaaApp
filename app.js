
const express = require('express');
const connectDB = require('./config/db');
const session = require('express-session');
// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json()); // Middleware to parse JSON
app.use(express.urlencoded({
        extended: true
}));


app.use(session({
        secret: 'supersecretkey',
        resave: false,
        saveUninitilized: true,
        cookie: {secure:true}
}));

const authRoutes = require('./routes/authRoutes');

app.use('/api/auth',authRoutes);
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get("/api/welcome", (req, res) => {
        res.status(200).send("welcome");
})


