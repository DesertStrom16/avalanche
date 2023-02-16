const puppeteer = require("puppeteer");
//   page.window.scrollBy(0, document.body.scrollHeight);

const funcHere = async () => {
  const browser = await puppeteer.launch({ headless: false });

  const page = await browser.newPage();
  page.on("response", async (response) => {
    if (
      response.url().includes("https://www.youtube.com/youtubei/v1/search?key=")
    ) {
      let data = await response.json();
      console.log("response:", data);
    }
  });
  await page.goto(`https://www.youtube.com/results?search_query=f1`, {
    waitUntil: "domcontentloaded",
  });
    await page.mouse.move(100, 100);

    let mainDiv = await page.$('ytd-app');
    let divBounding = await mainDiv.boundingBox()
    await page.mouse.wheel({ deltaY: divBounding.height });
  //   await browser.close();
};

funcHere();
