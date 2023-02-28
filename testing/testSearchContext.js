const axios = require("axios");
const { initialSearchResponseParser } = require("../src/functions/parseHandler");

const testing = async () => {
  let query = "lmp2";

  await axios
    .get(`https://www.youtube.com/results?search_query=${query}`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let content = initialSearchResponseParser(data);
        console.log(content);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};

testing();
