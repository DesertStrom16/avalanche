const axios = require("axios");

const testFunc = async () => {
    const browser = await puppeteer.launch({ headless: false });
    let paginatePage;
    paginatePage = await browser.newPage();
    page.on("response", async (response) => {
        if (
          response.url().includes("https://www.youtube.com/youtubei/v1/search?key=")
        ) {
          console.log("DATA HERE")
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

      paginatePage = await browser.newPage();
    await paginatePage.goto(
      `https://www.youtube.com/results?search_query=${query}`,
      {
        waitUntil: "networkidle2",
      }
    );

    // Lower so not starting autoplay on hover?
    await paginatePage.mouse.move(100, 100);
    
};

testFunc();
