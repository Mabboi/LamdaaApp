const bcrypt = require('bcryptjs');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const validatePassword = require('../helpers/validatePassword');  // Importing the password validation helper

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'databasetestbj@gmail.com',
        pass: 'vytpclurbsbjuuto'
    }
});

// Generate OTP (4 digits)
const generateOTP = () => crypto.randomInt(1000, 9999).toString();

// Register User and Save Email in Session
exports.register = async (req, res) => {
    try {
        const { firstname, lastname, phone, email, password, confirmPassword } = req.body;

        // Validate password confirmation
        validatePassword(password, confirmPassword);

        let user = await User.findOne({ $or: [{ email }, { phone }] });

        if (user) return res.status(400).json({ message: 'User with this email or phone already exists' });

        // Encrypt password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        user = new User({ firstname, lastname, phone, email, password: hashedPassword, otp, otpExpiry });
        await user.save();

        // Store email in session
        req.session.user_email = email;

        await transporter.sendMail({
            from: 'databasetestbj@gmail.com',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`
        });

        res.status(201).json({ message: 'User registered. Please verify OTP.', email });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Error registering user', error });
    }
};

// Verify OTP Using Session Email
exports.verifyOTP = async (req, res) => {
    try {
        // Retrieve email from session
        const email = req.session.user_email;
        if (!email) return res.status(400).json({ message: 'Session expired. Please register again.' });

        const { otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        if (user.otp !== otp || user.otpExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Clear session after successful verification
        req.session.user_email = null;

        res.json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });
        if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await transporter.sendMail({
            from: 'databasetestbj@gmail.com',
            to: email,
            subject: 'Resend OTP Verification',
            text: `Your new OTP is: ${otp}`
        });

        res.json({ message: 'OTP resent successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error resending OTP', error });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: 'User not found' });

        // Compare the entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect password' });

        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified. Please verify OTP.' });
        }

        req.session.user = { id: user._id, email: user.email, name: user.firstname };
        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
};

// Logout User
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Error logging out' });
        res.json({ message: 'Logged out successfully' });
    });
};

// Dashboard (Protected Route)
exports.dashboard = async (req, res) => {
    res.json({ message: `Welcome to the dashboard, ${req.session.user.name}` });
};
