const apiKeyParser = (data) => {
       // API key
   let apiBeginning = data.indexOf("innertubeApiKey");
   let apiEnd = data.indexOf("innertubeApiVersion");
   const apiKey = data.substring(apiBeginning + 18, apiEnd - 3);
   return apiKey;
}

module.exports = {apiKeyParser}