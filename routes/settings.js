// routes/settings.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { User, validateUpdate } = require('../models/User');
const router = express.Router();
const { verifyToken } = require('../middlewares/verifyToken');

/**
 * @des Get user settings
 * @route /
 * @method GET
 * @access private
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password'); // Exclude the password from the response
    if (!user) return res.status(404).json({ status: "error", message: 'User not found' });
    res.status(200).json({ status: "success", message: "User found", user });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

/**
 * @des Update user information
 * @route /update-info
 * @method PUT
 * @access private
 */
router.put('/update-info', verifyToken, async (req, res) => {
  const { error } = validateUpdate(req.body);
  if (error) return res.status(400).json({ status: "error", message: error.details[0].message });
  const userId = req.user.id;
    const user = await User.findById(userId).select('-password'); // Exclude the password from the response
    if (!user) return res.status(404).json({ status: "error", message: 'User not found' });
    
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }

  try {
    const userUpdate = await User.findByIdAndUpdate(userId, req.body, { new: true }).select('-password');
    if (!userUpdate) {
      return res.status(404).json({ status: "error", message: "Failed to update user information" });
    }
    res.status(200).json({ status: "success", message: "User information updated successfully", user: userUpdate });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Server Error" });
  }
});

/**
 * @des Delete user account
 * @route /
 * @method DELETE
 * @access private
 */
router.delete('/update-info', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password'); // Exclude the password from the response

    if (!user) {
      return res.status(404).json({ status: "error", message: 'User not found' });
    }

    await User.findByIdAndDelete(userId); // Delete the user
    return res.status(200).json({ status: "success", message: "User account deleted successfully" });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ status: "error", message: "Failed to delete user account" });
  }
});


module.exports = router;
