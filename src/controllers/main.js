const axios = require("axios");
const { initialSearchResponseParser } = require("../functions/parseHandler");

exports.fetchAutoSearch = async (req, res) => {
  const term = req.query.q;
  const autoSearchTerms = [];

  await axios
    .get(process.env.AUTO_SEARCH_URL + `&q=${term}&xhr=t`)
    .then(function (response) {
      if (response.data[1]) {
        response.data[1].forEach((item) => {
          autoSearchTerms.push(item[0]);
        });
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });

  res.json({ data: autoSearchTerms });
};

exports.fetchSearch = async (req, res, next) => {
  const query = req.query.q;

  await axios
    .get(`https://www.youtube.com/results?search_query=${query}`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let resObj = initialSearchResponseParser(data);

        if (
          resObj &&
          resObj.content.length > 0 &&
          resObj.content[0].content.length > 0
        ) {
          res.json(resObj);
        } else {
          res.sendStatus(500);
        }

        // res.sendStatus(500);
      }
    })
    .catch(function (error) {
      // handle error
      // console.log(error);
      next(error);
    });
};
