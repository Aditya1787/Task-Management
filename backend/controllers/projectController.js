const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Admin sees all projects, members see projects they are part of
    let query;
    if (req.user.role === 'admin') {
      query = {};
    } else {
      query = { members: req.user.id };
    }

    const projects = await Project.find(query).populate('members', 'name email');
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const projectMembers = members ? [...members] : [];
    if (!projectMembers.includes(req.user.id)) {
      projectMembers.push(req.user.id);
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: projectMembers
    });

    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/add-member
// @access  Private/Admin
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find user by email
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Check if user is already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    project.members.push(userToAdd._id);
    await project.save();

    // Re-fetch and populate members so the frontend gets the full member data immediately
    const updatedProject = await Project.findById(req.params.id).populate('members', 'name email');

    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  addMember
};
