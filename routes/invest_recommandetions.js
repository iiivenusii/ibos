const express = require('express');
const { User } = require('../models/User');
const  { groupBySector, market, setupMarket} = require('../functions/fun_investRecommend');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const marketSetup = await setupMarket();
    const filters = await groupBySector(marketSetup);
    const minMarket = await market(marketSetup);

    

    // Respond with success status, message, and the fetched data
    res.status(200).json({
      status: "success",
      message: "Market data and filters fetched successfully",
      data: {
        filters,
        minMarket,
        totalPages: 80
      }
    });

    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      status: "error",
      message: 'Internal Server Error'
    });
  }
});



module.exports = router;