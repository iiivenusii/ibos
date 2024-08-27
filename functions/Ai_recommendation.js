const dotenv = require('dotenv');
dotenv.config();

const { CohereClient } = require('cohere-ai');

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

async function Ai(companys) {
  const response = await cohere.chat({
    message: `# Your name is 'IBOS'.
    # Your task is to analyze the financial stock data of companies that you will receive,
    #Data to Consider:

    Market Capitalization
    Sector and Industry Trends
    Beta (volatility)
    Current Price and Price Trends
    Last Annual Dividend
    Trading Volume
    Exchange Information
    Country (if applicable)
    Flags (like isEtf, isFund, isActivelyTrading, star, and dealDone)
    # and then recommend the top five companies to invest in 
    # if not possible recommend three instead of five
    # in not possible recommend one instead of three.
    # return format:
    "recommendation": [
      {
          "rank": 1,
          "symbol": "",
          "companyName": "",
          "reasons": [
              "",
              "",
              ""
          ]
      }
  ]
    THIS IS THE STACK INFO:
    ${JSON.stringify(companys)}
    `,
    "response_format": {
        "type": "json_object"
    },
    model: "command-r-plus",
  });
  let jsonResponse;
  try {
    jsonResponse = JSON.parse(response.text);
  } catch (error) {
    console.error('Failed to parse AI response as JSON:', error);
    throw new Error('Invalid JSON response from AI');
  }
  return jsonResponse;
};

module.exports = { Ai };
