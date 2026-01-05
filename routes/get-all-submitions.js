const express = require('express');
const getFormAllByIdSubmissions = require('../middleware/getAllSubmitions');
const validateDateMatches = require('../controllers/validateDateMatches');
const getCustomFields = require('../middleware/getCustomField');
const getCustomFieldsSecond = require('../middleware/getSecondCustom');
const validateDateMatchesSecond = require('../controllers/validateDateSecond');
const validateAvailabilityByDateAndHour = require('../controllers/validateDate');
const router = express.Router();

router.post('/', 
    getFormAllByIdSubmissions,
    getCustomFieldsSecond,
    validateAvailabilityByDateAndHour
);

module.exports = router;
