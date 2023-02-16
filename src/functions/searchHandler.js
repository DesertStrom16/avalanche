const paginateSearchHandler = async (query, browser, io) => {
  const page = await browser.newPage();
  page.on("response", async (response) => {
    if (
      response.url().includes("https://www.youtube.com/youtubei/v1/search?key=")
    ) {
      let data = await response.json();
      // filter for video data them emit from here
      // Afterwords close page. Keeps browser open and pages accounted for
      // i.e. no general listener statements outside socket calls

      let resData = data.onResponseReceivedCommands[0].appendContinuationItemsAction.continuationItems[0].itemSectionRenderer.contents

      io.emit("paginateSearchReponse", resData);

      await page.close();
    }
  });
  await page.goto(`https://www.youtube.com/results?search_query=${query}`, {
    waitUntil: "domcontentloaded",
  });
  await page.mouse.move(100, 100);

  let mainDiv = await page.$("ytd-app");
  let divBounding = await mainDiv.boundingBox();
  await page.mouse.wheel({ deltaY: divBounding.height });
};

module.exports = { paginateSearchHandler };
