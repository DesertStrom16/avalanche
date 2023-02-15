const axios = require("axios");
const cheerio = require("cheerio");

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
        console.log(autoSearchTerms);
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });

  res.json({ data: autoSearchTerms });
};

exports.fetchSearch = async (req, res) => {
  const term = req.query.q;

  await axios
    .get(`https://www.youtube.com/results?search_query=${term}`)
    .then(function (response) {
      const data = response.data;
      if (data) {
        let beginning = data.indexOf("responseContext");
        let firstString = data.substring(beginning - 2);
        let end = firstString.indexOf("</script>");
        let finalString = firstString.substring(0, end - 1);
        let stringToJson = JSON.parse(finalString);
        let contentObj =
          stringToJson.contents.twoColumnSearchResultsRenderer.primaryContents
            .sectionListRenderer.contents[0].itemSectionRenderer.contents;

        let content = [];

        contentObj.forEach((item) => {
          if (item.videoRenderer) {
            console.log(item.videoRenderer.title.runs[0].text);

            const title = item.videoRenderer.title.runs[0].text;
            const channel = item.videoRenderer.ownerText.runs[0].text;
            const thumbnailUrl = item.videoRenderer.thumbnail.thumbnails;
            const avatarUrl =
              item.videoRenderer.channelThumbnailSupportedRenderers
                .channelThumbnailWithLinkRenderer.thumbnail.thumbnails;
            const viewCount = item.videoRenderer.shortViewCountText.simpleText;
            const uploadDate = item.videoRenderer?.publishedTimeText?.simpleText ?? '';
            const length = item.videoRenderer.lengthText.simpleText;
            const videoId = item.videoRenderer.videoId;

            content.push({
              title: title,
              channel: channel,
              viewCount: viewCount,
              uploadDate: uploadDate,
              length: length,
              videoId: videoId,
              thumbnailUrl: thumbnailUrl[thumbnailUrl.length - 1].url,
              avatarUrl: avatarUrl[avatarUrl.length - 1].url,
            });
          }
        });

        res.json(content);
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
};
