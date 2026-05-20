const express = require('express');
const router = express.Router();
const { getProjects, createProject, addMember } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
  .get(protect, getProjects)
  .post(protect, authorize('admin'), createProject);

router.post('/:id/add-member', protect, authorize('admin'), addMember);

module.exports = router;
