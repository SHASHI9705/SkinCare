const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/login', (req, res) => {
    res.render('login');
});



router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword, age, skinType, allergies } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            age,
            skinType,
            allergies
        });

        await newUser.save();
        res.render('home');
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering user.");
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send("Invalid credentials.");
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.cookie('authToken', token, { httpOnly: true });

        res.render('home');
    } catch (err) {
        console.error(err);
        res.status(500).send("Login Error.");
    }
});

module.exports = router;
