const express = require('express');
const { Ai } = require('../functions/Ai_recommendation');
const { groupBySector, market, setupMarket } = require('../functions/fun_investRecommend');
const router = express.Router();
const { User, Company, validateCompany} = require('../models/User');
const { verifyToken } = require('../middlewares/verifyToken');


router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('companies -_id');
    if (!user) {
      return res.status(404).json({ status: "error", message: 'User not found' });
    }

    const starredCompanies = user.companies.filter(company => company.star);
    if (starredCompanies.length === 0) {
      return res.status(404).json({ status: "error", message: 'No favorite companies were found.' });
    }
    const ai_response = await Ai(starredCompanies);

    // Return success response with AI data
    res.status(200).json({
      status: 'success',
      message: 'AI recommendation generated successfully',
      data: ai_response
    });
  } catch (error) {
    console.error('Error:', error);

    // Return error response with status and message
    res.status(500).json({
      status: 'error',
      message: 'An internal server error occurred. Please try again later.',
      error: error.message
    });
  }
});

module.exports = router;
