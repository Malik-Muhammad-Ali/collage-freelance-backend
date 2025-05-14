const express = require('express');
const router = express.Router();
const {
  addStudent,
  loginStudent
} = require('../controllers/studentController');

// POST /students
router.post('/signup', addStudent);
router.post('/login', loginStudent);

module.exports = router;
