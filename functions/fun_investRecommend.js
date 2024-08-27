const dotenv = require('dotenv');
dotenv.config();
const fmpcloud_api = process.env.fmpcloud_api

const groupBySector = async (result) => {
  let groupedSector = {};

  for (let i = 0; i < result.length; i++) {
    let sectorName = result[i].sector;
    
    if (!groupedSector[sectorName]) {
      groupedSector[sectorName] = [];
    }
    groupedSector[sectorName].push(result[i]);
  }
  const filters = Object.keys(groupedSector);
  const sectorNames = filters.filter(sector => sector !== "" && sector !== "null");
  //console.log(sectorNames);
  return sectorNames;
}

const market = async (marketSet, filters = [], pagenumber = 0, budget = 0) => {
  const groupSize = 10;

  // Apply filters
  let filteredResults = marketSet;

  if (filters.length > 0) {
    filteredResults = filteredResults.filter(item => {
      return filters.includes(item.sector);
    });
  }

  if (budget > 0) {
    filteredResults = filteredResults.filter(item => {
      return item.price <= budget;
    });
  }

  const totalItems = filteredResults.length;
  const totalPages = Math.ceil(totalItems / groupSize);

  const startIndex = pagenumber * groupSize;
  const endIndex = startIndex + groupSize;


  const paginatedResults = filteredResults.slice(startIndex, endIndex);

  console.log(paginatedResults);
  return {
    paginatedResults: paginatedResults,
    totalPages
  };
};



const setupMarket = async (number=800) => {
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  const response = await fetch(`https://fmpcloud.io/api/v3/stock-screener?marketCapMoreThan=1000000000&limit=${number}&apikey=${fmpcloud_api}`, requestOptions);
  const result = await response.json(); 
  return result;
}






module.exports = { groupBySector, market, setupMarket };