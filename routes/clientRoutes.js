const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.post('/signup', clientController.addClient);
router.post('/login', clientController.loginClient);

module.exports = router;
