const axios = require("axios");
const {
  initialSearchResponseParser,
  videoParser,
} = require("../functions/parseHandler");
const { apiKeyParser } = require("../functions/apiKeyHandler");
const { clientContextParser } = require("../functions/clientContextHandler");

exports.fetchRecommended = async (req, res, next) => {
  const videoId = req.query.v;

  await axios
    .get(`https://www.youtube.com/watch?v=${videoId}`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let apiKey = apiKeyParser(data);
        let client = clientContextParser(data);

        let firstIndex = data.indexOf(`ytInitialData = {"responseContext"`);
        let firstString = data.substring(firstIndex + 16);

        let lastIndex = firstString.indexOf("</script>");
        let lastString = firstString.substring(0, lastIndex - 1);
        let resString = JSON.parse(lastString);

        const watchTitle =
        resString.contents.twoColumnWatchNextResults.results.results.contents[0]
            .videoPrimaryInfoRenderer.title.runs[0].text;

        let vidData =
          resString.contents.twoColumnWatchNextResults.secondaryResults
            .secondaryResults.results;

        let content = [];
        let contToken;

        vidData.forEach((item, index) => {
          if (item.compactVideoRenderer) {
            const vidItem = item.compactVideoRenderer;
            const title = vidItem.title.simpleText ?? "";
            const channel = vidItem.longBylineText.runs[0].text;
            const thumbnailUrl = vidItem.thumbnail.thumbnails;
            const avatarUrl = vidItem.channelThumbnail.thumbnails ?? "";
            const viewCount = vidItem.shortViewCountText?.simpleText ?? "";
            const uploadDate = vidItem.publishedTimeText?.simpleText ?? "";
            const length = vidItem.lengthText?.simpleText ?? "";
            const videoId = vidItem.videoId;

            content.push({
              title: title,
              channel: channel,
              viewCount: viewCount,
              uploadDate: uploadDate,
              length: length,
              videoId: videoId,
              thumbnailUrl: thumbnailUrl[thumbnailUrl.length - 1].url,
              avatarUrl: avatarUrl[avatarUrl.length - 1]?.url,
            });
          } else if (item.continuationItemRenderer) {
            contToken =
              item.continuationItemRenderer.continuationEndpoint
                .continuationCommand.token;
          }
        });

        let resObj = {
          content: { token: contToken, content: content },
          ...client,
          key: apiKey,
          watchTitle: watchTitle,
        };

        if (resObj && resObj.content && resObj.content.content?.length > 0 && watchTitle) {
          res.json(resObj);
        } else {
          res.sendStatus(500);
        }
        // res.json(resString);
      }
    })
    .catch(function (error) {
      next(error);
    });
};
