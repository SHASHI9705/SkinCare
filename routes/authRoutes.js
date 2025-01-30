const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register Page Route
router.get('/register', (req, res) => {
    res.render('register');
});

// Login Page Route
router.get('/login', (req, res) => {
    res.render('login');
});

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, age, skinType, allergies } = req.body;

        // Check if password and confirmPassword match
        if (password !== confirmPassword) {
            return res.status(400).send("Passwords do not match.");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user object
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            skinType,
            allergies
        });

        // Save the new user to the database
        await newUser.save();
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering user.");
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // If no user is found or password is incorrect
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send("Invalid credentials.");
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Set the token in a cookie
        res.cookie('authToken', token, { httpOnly: true });

        // Redirect to the dashboard
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send("Login Error.");
    }
});

module.exports = router;
