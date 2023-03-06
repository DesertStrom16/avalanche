const axios = require("axios");
const {
  initialSearchResponseParser,
  videoParser,
} = require("../functions/parseHandler");

exports.fetchAutoSearch = async (req, res, next) => {
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
      next(error);
    });

  res.json({ data: autoSearchTerms });
};

exports.fetchSearch = async (req, res, next) => {
  const query = req.query.q;

  await axios
    .get(`https://www.youtube.com/results?search_query=${query.replace(" ", '+')}`)
    .then(function (response) {
      // console.log(response.config.url)
      const data = response.data;
      if (data) {
        let resObj = initialSearchResponseParser(data);

        if (
          resObj &&
          resObj.content &&
          resObj.content.content?.length > 0
        ) {
          res.json({...resObj, query: query});
        } else {
          res.sendStatus(500);
        }

        // res.sendStatus(500);
      }
    })
    .catch(function (error) {
      next(error);
    });
};

exports.postSearchContinuation = async (req, res, next) => {
  const { client, token, key, query } = req.body;

  await axios
    .post(
      `https://www.youtube.com/youtubei/v1/search?key=${key}&prettyPrint=false`,
      { continuation: token, context: { client: client } }
    )
    .then(function (response) {
      const data = response.data;
      if (data) {
        let newToken =
          data.onResponseReceivedCommands[0].appendContinuationItemsAction
            .continuationItems[1].continuationItemRenderer.continuationEndpoint
            .continuationCommand.token;

        let newContent =
          data.onResponseReceivedCommands[0].appendContinuationItemsAction
            .continuationItems[0].itemSectionRenderer.contents;

        let contentParsed = videoParser(newContent);

        if (contentParsed && contentParsed.length > 0 && newToken) {
          res.json({ token: newToken, content: contentParsed, query: query });
        } else {
          res.sendStatus(500);
        }
      }
    })
    .catch(function (error) {
      next(error);
    });
};
