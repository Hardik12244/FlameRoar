const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');

router.post('/execute', codeController.executeCode);
router.post('/submit', codeController.submitCode);

module.exports = router;

