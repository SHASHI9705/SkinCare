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

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

// Set up file upload using multer
const upload = multer({
    dest: 'public/uploads/',
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
            return cb(new Error('Only image files are allowed.'));
        }
        cb(null, true);
    }
});

// Models and Routes
const User = require('./models/User');

// Online Cure Route - Show form for uploading image and symptoms
app.get('/online-cure', (req, res) => {
    if (!req.session.user) {
        return res.redirect('http://skin.test.woza.work/');
    }
    res.render('home');
});

// Handle image upload and symptom submission
app.post('/online-cure', upload.single('skinImage'), [
    body('symptoms').notEmpty().withMessage('Symptoms cannot be empty'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('online-cure', { errors: errors.array() });
    }

    // Get the data
    const { symptoms } = req.body;
    const imagePath = req.file ? req.file.path : null;

    // Save user analysis history to MongoDB
    const newAnalysis = new Analysis({
        user: req.session.user._id,
        symptoms: symptoms,
        imagePath: imagePath,
        date: new Date()
    });

    newAnalysis.save()
        .then(() => {
            // Here you would call your AI model to analyze the image and symptoms
            // For now, mock the AI response
            const analysisResult = {
                disease: 'Acne',
                severity: 'Moderate',
                suggestedTreatments: ['Topical Cream', 'Over-the-counter Medications']
            };

            res.render('online-cure-result', { analysis: analysisResult });
        })
        .catch(err => console.log(err));
});

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.render('welcome');
});

app.get('/preventionGuide', (req, res) => {
    res.render('guide');  
});

app.get('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.redirect('/auth/login');
});


app.get('/myhome', (req, res) => {
    res.render('home');
});

app.listen(3000, () => console.log("Server running on port 3000"));
