const initialSearchResponseParser = (data, page) => {
  if (data) {
    // API key
    let apiBeginning = data.indexOf("innertubeApiKey");
    let apiEnd = data.indexOf("innertubeApiVersion");
    const apiKey = data.substring(apiBeginning + 18, apiEnd - 3);

    // Continuation token for follow-on requests
    let tokenBeginning = data.indexOf('"continuationCommand"');
    let tokenFirst = data.substring(tokenBeginning + 22);
    let tokenEnd = tokenFirst.indexOf('"request"');
    let tokenLast = tokenFirst.substring(0, tokenEnd - 1);

    let continuationToken = JSON.parse(tokenLast + "}");

    // Client Context for follow-on requests
    let contextBeginning = data.indexOf('"client":');
    let contextEnd = data.indexOf('"user":');

    let contextLastString = data.substring(
      contextBeginning - 1,
      contextEnd - 1
    );

    let searchClientContext = JSON.parse(contextLastString + "}");
    // Retrieve Videos for Search
    let beginning = data.indexOf("responseContext");
    let firstString = data.substring(beginning - 2);
    let end = firstString.indexOf("</script>");
    let finalString = firstString.substring(0, end - 1);
    let stringToJson = JSON.parse(finalString);

    let contentObj;
    let channelInfo;

    if (page === "homepage") {
      contentObj = [];
      stringToJson.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents.map(
        (item) => {
          if (item.richItemRenderer) {
            contentObj.push(item.richItemRenderer.content);
          }
        }
      );
    } else if (page === "channel") {
      let preLoopedContent =
        stringToJson.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer
          .content.richGridRenderer;

      contentObj = [];
      preLoopedContent.contents.forEach((item) => {
        // TODO
        // Better way to do this other than looping twice.
        if (item.richItemRenderer?.content) {
          contentObj.push(item.richItemRenderer?.content);
        }
      });
      channelInfo = stringToJson.metadata.channelMetadataRenderer;
    } else {
      contentObj =
        stringToJson.contents.twoColumnSearchResultsRenderer.primaryContents
          .sectionListRenderer.contents[0].itemSectionRenderer.contents;
    }

    let content = videoParser(contentObj);
    let channelInfoFinal = {};

    if (page === "channel") {
      channelInfoFinal = {
        channelInfo: {
          title: channelInfo.title,
          avatarThumbnail: channelInfo.avatar.thumbnails[0],
        },
      };
    }

    return {
      ...searchClientContext,
      content: {
        ...continuationToken,
        content: content,
        ...channelInfoFinal,
      },
      key: apiKey,
    };
  }
};

const videoParser = (data) => {
  let content = [];
  let channelTemp;

  data.forEach((item) => {
    if (item.videoRenderer) {
      const vidItem = item.videoRenderer;
      const title = vidItem.title.runs[0].text;

      // console.log(vidItem)

      if (vidItem.ownerText) {
        channelTemp = vidItem.ownerText.runs[0].text;
      } else {
        // TODO
        // reformat this using typescript so we can change the object makeup without confusion across endpoints.
        channelTemp = "N/A";
      }

      const channel = channelTemp;
      const thumbnailUrl = vidItem.thumbnail.thumbnails;
      const avatarUrl =
        vidItem.channelThumbnailSupportedRenderers
          ?.channelThumbnailWithLinkRenderer.thumbnail.thumbnails ?? "";
      const viewCount = vidItem.shortViewCountText?.simpleText ?? "";
      const uploadDate = vidItem.publishedTimeText?.simpleText ?? "";
      const length = vidItem.lengthText?.simpleText ?? "";
      const videoId = vidItem.videoId;

      let desc =
        vidItem.detailedMetadataSnippets?.length > 0 &&
        vidItem.detailedMetadataSnippets[0].snippetText.runs.length > 0
          ? vidItem.detailedMetadataSnippets[0].snippetText?.runs[0]?.text
          : "";

      if (
        desc &&
        vidItem.detailedMetadataSnippets[0].snippetText.runs.length > 1
      ) {
        const [, ...rest] =
          vidItem.detailedMetadataSnippets[0].snippetText.runs;
        rest.forEach((item) => {
          if (item.text) {
            desc = desc + item.text;
            // item.bold ???
          }
        });
      }

      content.push({
        title: title,
        channel: channel,
        viewCount: viewCount,
        uploadDate: uploadDate,
        length: length,
        videoId: videoId,
        thumbnailUrl: thumbnailUrl[thumbnailUrl.length - 1].url,
        avatarUrl: avatarUrl[avatarUrl.length - 1]?.url,
        desc: desc,
        // apiKey: apiKey,
        // cookie: null,
      });
    }
  });

  return content;
};

module.exports = { initialSearchResponseParser, videoParser };
