const axios = require("axios");
const { initialSearchResponseParser, videoParser } = require("../functions/parseHandler");

exports.fetchHome = async (req, res, next) => {
  await axios
    .get(`https://www.youtube.com/`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let resObj = initialSearchResponseParser(data, "homepage");
        // console.log(resObj)
        if (resObj && resObj.content && resObj.content.content?.length > 0) {
          res.json({ ...resObj });
        } else {
          res.sendStatus(500);
        }
      }
    })
    .catch(function (error) {
      next(error);
    });
};

exports.postHomeContinuation = async (req, res, next) => {
  const { client, token, key } = req.body;

  await axios
    .post(
      `https://www.youtube.com/youtubei/v1/browse?key=${key}&prettyPrint=false`,
      { continuation: token, context: { client: client } }
    )
    .then(function (response) {
      const data = response.data;
      if (data) {
        let vidContent = [];
        let newToken;
        let dataVar =
          data.onResponseReceivedActions[0].appendContinuationItemsAction;


        if (dataVar.continuationItems) {
          dataVar.continuationItems.forEach((item) => {
            if (item.richItemRenderer) {
              vidContent.push(item.richItemRenderer.content);
            } else if (item.continuationItemRenderer) {
              newToken =
                item.continuationItemRenderer.continuationEndpoint
                  .continuationCommand.token;
            }
          });
        }

        let contentParsed = videoParser(vidContent);

        if (contentParsed && contentParsed.length > 0 && newToken) {
          res.json({ token: newToken, content: contentParsed });
        } else {
          res.sendStatus(500);
        }
      }
    })
    .catch(function (error) {
      next(error);
    });
};
