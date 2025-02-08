require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');

// Initialize app
const app = express();

// Set up EJS and middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());  // For parsing JSON data
app.use(express.static('public'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const User = require('./models/User');

app.get('/onlineCure', (req, res) => {
    if (!req.session.user) {
        return res.render('onlineCure');
    }
    res.render('onlineCure');
});

app.get('/book', (req, res) => {
    res.render('book');
});

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/myhome');
    }
    res.render('welcome');
});

app.get('/preventionGuide', (req, res) => {
    res.render('guide');  
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return console.log(err);
        }
        res.clearCookie('authToken');
        res.redirect('/auth/login');
    });
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/myhome', (req, res) => {
    if (req.session.user) {
        console.log('User is logged in:', req.session.user);
        return res.render('home', { user: req.session.user });
    }
    console.log('User is not logged in');
    res.render('login');
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
