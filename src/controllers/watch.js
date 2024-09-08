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

        // Not sure any of this is needed
        // let firstIndexChannel = data.indexOf(`ytInitialPlayerResponse = {"responseContext"`);
        // let firstStringChannel = data.substring(firstIndexChannel + 26);

        // let lastIndexChannel = firstStringChannel.indexOf("</script>");
        // let lastStringChannel = firstStringChannel.substring(0, lastIndexChannel - 1);
        // let resStringChannel = JSON.parse(lastStringChannel);
        // const channelName = resStringChannel.videoDetails.author

        // INFO HERE
        // This is the video being watched information:
        // resString.contents.twoColumnWatchNextResults.results.results.contents[0]

        // This is the list of recommended videos for the video that's playing:
        // resString.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results

        // Not sure why I thought I needed this?
        // const channelUrl = resString.engagementPanels[2].engagementPanelSectionListRenderer.content.structuredDescriptionContentRenderer.items[0].videoDescriptionHeaderRenderer.channelThumbnail.thumbnails[0].url

        const watchTitle =
          resString.contents.twoColumnWatchNextResults.results.results
            .contents[0].videoPrimaryInfoRenderer.title.runs[0].text;

        console.log(
          resString.contents.twoColumnWatchNextResults.results.results
            .contents[0].videoPrimaryInfoRenderer.viewCount
        );

        const videoViewCountAllOptions =
          resString.contents.twoColumnWatchNextResults.results.results
            .contents[0].videoPrimaryInfoRenderer.viewCount
            .videoViewCountRenderer;

        const videoViewCount = videoViewCountAllOptions.shortViewCount?.simpleText ? videoViewCountAllOptions.shortViewCount?.simpleText : videoViewCountAllOptions.extraShortViewCount?.simpleText

        // const videoViewCount =
        //   resString.contents.twoColumnWatchNextResults.results.results
        //     .contents[0].videoPrimaryInfoRenderer.viewCount
        //     .videoViewCountRenderer.shortViewCount.simpleText;

        const videoDateText =
          resString.contents.twoColumnWatchNextResults.results.results
            .contents[0].videoPrimaryInfoRenderer.relativeDateText.simpleText;

        // Secondary has description with show more/show less, thumbnail urls with different sizes, etc.
        const secondaryVideoInfo =
          resString.contents.twoColumnWatchNextResults.results.results
            .contents[1].videoSecondaryInfoRenderer;

        const channelCannonicalURL =
          secondaryVideoInfo.owner.videoOwnerRenderer.navigationEndpoint
            .browseEndpoint.canonicalBaseUrl;
        const videoDescription =
          secondaryVideoInfo.attributedDescription.content;
        const channelSubCount =
          secondaryVideoInfo.owner.videoOwnerRenderer.subscriberCountText
            .simpleText.replace("subscribers", "");
        const channelTitle =
          secondaryVideoInfo.owner.videoOwnerRenderer.title.runs[0].text;
        const channelThumbnail =
          secondaryVideoInfo.owner.videoOwnerRenderer.thumbnail.thumbnails;

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

            // content in this context is the recommended videos
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
          watchTitle,
          channelCannonicalURL,
          videoDescription,
          channelSubCount,
          channelTitle,
          channelThumbnail,
          videoViewCount,
          videoDateText,
          secondaryVideoInfo: secondaryVideoInfo,
          resString: resString,
        };

        if (
          resObj &&
          resObj.content &&
          resObj.content.content?.length > 0 &&
          watchTitle
        ) {
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
