const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },  
    email: { type: String, required: true, unique: true },
    phone: { 
        type: String, 
        required: true, 
        unique: true,
        match: [/^\d{10,15}$/, 'Invalid phone number'] // Ensures valid phone format
    },
    password: { type: String, required: true },
    otp: { type: String }, 
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
