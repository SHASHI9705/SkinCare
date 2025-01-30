const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symptoms: {
        type: String,
        required: true
    },
    imagePath: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
