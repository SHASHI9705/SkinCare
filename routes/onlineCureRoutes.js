const express = require('express');
const multer = require('multer');
const path = require('path');
const { analyzeSkin } = require('../utils/aiAnalyzer');
const Analysis = require('../models/Analysis');

const router = express.Router();

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/'); // Ensure public/uploads/ exists
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('skinImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        const symptoms = req.body.symptoms;
        const imagePath = req.file.path;

        const result = await analyzeSkin(imagePath, symptoms);

        const analysis = new Analysis({
            user: req.user ? req.user.id : null, 
            imagePath: imagePath, 
            symptoms: symptoms,
            disease: result.disease,
            severity: result.severity,
            treatments: result.treatments,
        });

        await analysis.save();

        res.render('analysisResult', { result });

    } catch (err) {
        console.error("Error processing skin analysis:", err);
        res.status(500).send("Error processing analysis.");
    }
});

module.exports = router;
