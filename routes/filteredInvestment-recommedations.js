const express = require('express');
const { User } = require('../models/User');
const  { groupBySector, market, setupMarket} = require('../functions/fun_investRecommend');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    // Set up the market data
    const marketSetup = await setupMarket();

    // Destructure the filters, page, and budget from the request body
    const { filters, page, budget } = req.body; 

    // Get the paginated market data and total pages
    const { paginatedResults, totalPages } = await market(marketSetup, filters, page, budget);

    console.log('Filters:', filters);
    console.log('Page:', page);
    console.log('Budget:', budget);

    // Respond with success status, message, and the market data
    res.status(200).json({
      status: "success",
      message: "Market data fetched successfully",
      filters: [
        "Technology",
        "Communication Services",
        "Consumer Cyclical",
        "Financial Services",
        "Healthcare",
        "Consumer Defensive",
        "Energy",
        "Basic Materials",
        "Industrials",
        "Utilities",
        "Real Estate"
      ],
      data: paginatedResults,
      totalPages: totalPages
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