const analyzeSkin = (imagePath, symptoms) => {
    return new Promise((resolve) => {
        const result = {
            disease: 'Acne',
            severity: 'Moderate',
            treatments: ['OTC Acne Cream', 'Proper Skincare Routine', 'Consult a Dermatologist']
        };
        resolve(result);
    });
};

module.exports = { analyzeSkin };
