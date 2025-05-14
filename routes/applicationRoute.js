const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

router.post('/', applicationController.addApplication);
router.put('/accept-application/:applicationId', applicationController.acceptApplication);
router.get("/my-projects/:studentId", applicationController.getApplicationsByStudentId);

module.exports = router;
