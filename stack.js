//56d3dea99c42729404922b7ed7c54b19
//https://fmpcloud.io/documentation#stockScreener
const Market = async ()=>{
  var requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };
  const response = await fetch(`https://fmpcloud.io/api/v3/stock-screener?marketCapMoreThan=1000000000&limit=100&apikey=56d3dea99c42729404922b7ed7c54b19`, requestOptions);
  const result = await response.json(); 
  console.log(`return: ${JSON.stringify(result)}`);
}
Market();