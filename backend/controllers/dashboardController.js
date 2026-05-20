const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    let baseQuery = {};
    
    // Filter stats for non-admin users
    if (req.user.role !== 'admin') {
      const projects = await Project.find({ members: req.user.id });
      const projectIds = projects.map(p => p._id);
      
      baseQuery = {
        $or: [
          { assignedTo: req.user.id },
          { projectId: { $in: projectIds } }
        ]
      };
    }

    const total = await Task.countDocuments(baseQuery);
    
    const completed = await Task.countDocuments({ 
      ...baseQuery,
      status: 'completed' 
    });
    
    const pending = await Task.countDocuments({ 
      ...baseQuery,
      status: 'pending' 
    });

    const inProgress = await Task.countDocuments({ 
      ...baseQuery,
      status: 'in-progress' 
    });

    const overdue = await Task.countDocuments({
      ...baseQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    });

    res.json({
      total,
      completed,
      pending,
      inProgress,
      overdue
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
};
