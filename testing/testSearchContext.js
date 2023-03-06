const axios = require("axios");
const {
  initialSearchResponseParser,
  videoParser,
} = require("../src/functions/parseHandler");

const testingSearch = async () => {
  let query = "lmp2";

  await axios
    .get(`https://www.youtube.com/results?search_query=${query}`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let content = initialSearchResponseParser(data);
        // console.log(content);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};

const testingHome = async () => {
  await axios
    .get(`https://www.youtube.com/`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let content = initialSearchResponseParser(data, "homepage");
        console.log(content.content);
      }
    })
    .catch(function (error) {
      console.log(error);
    });
};

const testingHomeCont = async () => {
  // const { client, token, key, query } = req.body;
  // await axios
  //   .post(`https://www.youtube.com/youtubei/v1/browse?key=${}&prettyPrint=false`, { continuation: token, context: { client: client } })
  //   .then(function (response) {
  //     const data = response.data;
  //     if (data) {
  //       // let content = initialSearchResponseParser(data, 'homepage');
  //       // console.log(content.content);
  //     }
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });
};

const testingWatchCont = async () => {
  const videoId = "PQmSUHhP3ug";

  await axios
    .get(`https://www.youtube.com/watch?v=${videoId}`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let firstIndex = data.indexOf(`ytInitialData = {"responseContext"`);
        let firstString = data.substring(firstIndex + 16);

        let lastIndex = firstString.indexOf('</script>');
        let lastString = firstString.substring(0, lastIndex);

        console.log(lastString)
   
      }
    })
    .catch(function (error) {
      next(error);
    });
};

testingWatchCont();
