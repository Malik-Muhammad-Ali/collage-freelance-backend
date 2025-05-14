const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');

router.post('/', projectController.addProject);
router.get('/', projectController.getAllProjects);
router.get('/client/:clientId', projectController.getClientData);
router.put('/:projectId/status', projectController.updateProjectStatus);

module.exports = router;
