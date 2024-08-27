const express = require('express');
const router = express.Router();
const {User, validateRegister, personalInfoValidate, validateFinancialInfo, validateLoginUser} = require('../models/User');
const { verifyToken } = require('../middlewares/verifyToken');
const dotenv = require('dotenv');
const { market } = require('../functions/fun_investRecommend');
dotenv.config();

const fmpcloud_api = process.env.fmpcloud_api;

const companys = ["AAPL", "AMZN", "META"];
/**
 * Fetches the current price of gold from the API Ninjas service.
 *
 * This function sends a GET request to the "https://api.api-ninjas.com/v1/goldprice" endpoint
 * with an API key provided in the headers for authentication. Upon receiving a response,
 * it extracts the gold price from the response data, constructs an object with the gold price,
 * and logs the result.
 *
 * @returns {Promise<string>} A JSON string representing the gold price and currency.
 */
const goldMarket = async () =>{
  var myHeaders = new Headers();
  myHeaders={'X-Api-Key': '92sEOz3/QPmY0C2dShJraQ==oalo9VGWNIxUGQjC'}
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
  };

  const response = await fetch("https://api.api-ninjas.com/v1/goldprice",requestOptions);
  const result = await response.json(); 
  const goldPrice = {
    name: "GOLD.",
    price: result.price,
    currency:"USD"}
  console.log(`return: ${JSON.stringify(goldPrice)}`);
  return (goldPrice);
}


/**
 * Helper function to get a date string in YYYY-MM-DD format.
 * @param {Date} date - The date object to format.
 * @returns {string} - The formatted date string.
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};
/**
 * Fetches the gold price for a specific date from the Metal Price API.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<Object>} - An object representing the gold price and currency for that date.
 */
/**
 * Fetches the gold price for a specific date from the Metal Price API.
 * @param {string} date - The date in YYYY-MM-DD format.
 * @returns {Promise<Object>} - An object representing the gold price and currency for that date.
 */
const fetchGoldPriceForDate = async (date) => {
  const url = `https://api.metalpriceapi.com/v1/${date}?api_key=e99cf51312f5fdffc7142622600a8a54&base=USD&currencies=XAU`;

  const response = await fetch(url);
  const result = await response.json();

  if (result.success === false) {
      throw new Error(result.message || `Failed to fetch gold price for date ${date}`);
  }

  return {
      date,
      price: result.rates.USDXAU,
      currency: "USD"
  };
};


/**
 * Fetches the gold prices for the last 15 days from the Metal Price API.
 * @returns {Promise<Array<Object>>} - An array of objects representing the gold prices and dates.
 */
const goldHistory = async () => {
  const today = new Date();
  const promises = [];

  for (let i = 1; i <= 2; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const formattedDate = formatDate(date);
      promises.push(fetchGoldPriceForDate(formattedDate));
  }

  // Wait for all the fetches to complete
  const results = await Promise.all(promises);
  return results;
};

/**
 * Fetches the current stock price for a given company from the API Ninjas service.
 *
 * This function sends a GET request to the "https://api.api-ninjas.com/v1/stockprice" endpoint
 * with the company's ticker symbol as a query parameter and an API key in the headers for authentication.
 * Upon receiving a response, it extracts the stock price and company name, constructs an object with
 * these details, and logs the result.
 *
 * @param {string} symbol - The stock ticker symbol of the company (e.g., "AAPL" for Apple).
 * @returns {Promise<string>} A JSON string representing the company's name, stock price, and currency.
 */
const Market = async (symbol) => {
  const apiKey = fmpcloud_api;
  const response = await fetch(`https://fmpcloud.io/api/v3/quote/${symbol}?apikey=${apiKey}`);
  const result = await response.json();

  // Assuming result is an array and the first element contains the needed data
  return {
      name: result[0].name || symbol,
      price: result[0].price
  };
};


router.get('/', verifyToken, async (req, res) => {
  try {
    //gold = await goldMarket();
    //const aapl = await Market("AAPL");
    //const amzn = await Market("AMZN");
    //const meta = await Market("META");
    const gold = {
      "name": "Gold",
      "price": 226.84
  };
    const aapl= {
      "name": "Apple Inc.",
      "price": 226.84
  };
  const amzn = {
      "name": "Amazon.com, Inc.",
      "price": 177.04
  };
  const meta = {
      "name": "Meta Platforms, Inc.",
      "price": 528
  };
    
    //goldhistory = await goldHistory();

    //fake data
    const goldhistory = [
      { date: "2024-08-28", price: 2464.9374965799 },
      { date: "2024-08-27", price: 2476.1037418137 },
      { date: "2024-08-26", price: 2482.4658790035 },
      { date: "2024-08-25", price: 2457.9845637423 },
      { date: "2024-08-24", price: 2468.1347529384 },
      { date: "2024-08-23", price: 2473.9456374921 },
      { date: "2024-08-22", price: 2481.3752847389 },
      { date: "2024-08-21", price: 2467.9238475639 },
      { date: "2024-08-20", price: 2459.1847384923 },
      { date: "2024-08-19", price: 2465.3927485962 },
      { date: "2024-08-18", price: 2470.9384756293 },
      { date: "2024-08-17", price: 2482.4375839457 },
      { date: "2024-08-16", price: 2463.9382745629 },
      { date: "2024-08-15", price: 2478.4927364923 },
      { date: "2024-08-14", price: 2480.9483756384 },
      { date: "2024-08-13", price: 2472.9374857923 }
    ];
    

    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ status: "error", message: 'User not found' });

    const DealCompanies = user.companies.filter(company => company.dealDone);

    // Construct the response object
    const response = {
      status: "success",
      message: "Market data fetched successfully",
      data: {
        user: {
          name: user.fullName,
          email:user.email
        },
        items: {
          aapl,
          aapl,
          amzn,
          meta
        },
        gold_history: goldhistory,
        DealCompanies: DealCompanies
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({ status: "error", message: 'Failed to fetch market data' });
  }
});


module.exports = router;
