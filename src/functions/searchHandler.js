const paginateSearchHandler = async (page, socket) => {
  page.on("response", async (response) => {
    if (
      response.url().includes("https://www.youtube.com/youtubei/v1/search?key=")
    ) {
      let data = await response.json();
      // filter for video data them emit from here
      // Afterwords close page. Keeps browser open and pages accounted for
      // i.e. no general listener statements (page.on) outside socket calls

      let resData =
        data.onResponseReceivedCommands[0].appendContinuationItemsAction
          .continuationItems[0].itemSectionRenderer.contents;

      let content = dataParseHandler(resData);

      // Finished, emit response.
      socket.emit("paginateSearchReponse", content);
    }
  });

  let mainDiv = await page.$("ytd-app");
  let divBounding = await mainDiv.boundingBox();
  await page.mouse.wheel({ deltaY: divBounding.height });
};

const dataParseHandler = (data) => {
  let content = [];
  data.forEach((item) => {
    if (item.videoRenderer) {
      let vid = item.videoRenderer;
      const title = vid.title.runs[0].text;
      const channel = vid.ownerText.runs[0].text;
      const thumbnailUrl = vid.thumbnail.thumbnails;
      const avatarUrl =
        vid.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer
          .thumbnail.thumbnails;
      const viewCount = vid?.shortViewCountText?.simpleText ?? "";
      const uploadDate = vid?.publishedTimeText?.simpleText ?? "";
      const length = vid?.lengthText?.simpleText ?? "";
      const videoId = vid.videoId;

      content.push({
        title: title,
        channel: channel,
        viewCount: viewCount,
        uploadDate: uploadDate,
        length: length,
        videoId: videoId,
        thumbnailUrl: thumbnailUrl[thumbnailUrl.length - 1].url,
        avatarUrl: avatarUrl[avatarUrl.length - 1].url,
        // apiKey: apiKey,
        // cookie: null,
      });
    }
  });

  return content;
};

module.exports = { paginateSearchHandler };
