const axios = require("axios");
const {
  initialSearchResponseParser,
} = require("../functions/parseHandler");

exports.fetchHome = async (req, res, next) => {
    await axios
    .get(`https://www.youtube.com/`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let resObj = initialSearchResponseParser(data, 'homepage');
        console.log(resObj)
        if (
            resObj &&
            resObj.content &&
            resObj.content.content?.length > 0
          ) {
            res.json({...resObj});
          } else {
            res.sendStatus(500);
          }
      }
    })
    .catch(function (error) {
        next(error);
    });
  };

  exports.postHomeContinuation = async (req, res, next) => {}