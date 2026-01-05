const express = require('express');
const validateDateMatches = require('../controllers/validateDateMatches');
const getCustomFields = require('../middleware/getCustomField');
const getFormAllSubmissionsByExperience = require('../middleware/getAllSubmitionsExperience');
const router = express.Router();

router.post('/', 
    getFormAllSubmissionsByExperience,
    getCustomFields,
    validateDateMatches
);

module.exports = router;
