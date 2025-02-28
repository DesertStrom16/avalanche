const axios = require("axios");
const cheerio = require("cheerio");

const cookie =
  "GPS=1; YSC=4H9FkQ55x2Q; DEVICE_INFO=ChxOekU1TlRBek1UazNOams1TVRBNE5qZzBOUT09EPbG554GGPbG554G; VISITOR_INFO1_LIVE=PvO_bHIGRtA; PREF=f4=4000000&tz=America.Los_Angeles; SID=TQjpAdF4SH53zKza0WVwkfQnIyQUM5C4-gohzCaqwxOiwrb5M0sAJVhV8-9lp1SMy3I-Rw.; __Secure-1PSID=TQjpAdF4SH53zKza0WVwkfQnIyQUM5C4-gohzCaqwxOiwrb55VAC-DpNjFR25sIkK3Kumg.; __Secure-3PSID=TQjpAdF4SH53zKza0WVwkfQnIyQUM5C4-gohzCaqwxOiwrb5dZmFgJUW2UW4b_w5goQxQQ.; HSID=Aid7bhdF-gGpr5lr9; SSID=AJNaZFjvc-PnvrloZ; APISID=Y_u_hUqXksvtcYQv/Ac9pJmPTJonhnWhFz; SAPISID=Qwcn8JzTeZoD4oZ2/AWgs12y2goCGv_9db; __Secure-1PAPISID=Qwcn8JzTeZoD4oZ2/AWgs12y2goCGv_9db; __Secure-3PAPISID=Qwcn8JzTeZoD4oZ2/AWgs12y2goCGv_9db; LOGIN_INFO=AFmmF2swRgIhAIJgs7WhEcXYSmRAuGl9cudhJ6M4HgSmEP-eqKpPSfClAiEAtXNE3gykt5FrPS5ckDvT3F7AoJYo0gbmrhbEGNvXpf8:QUQ3MjNmd1ZwOEF6clpIT053ZlJnSVV6SzRrZlg5VzNpaE12LThidnIwSFFmYU1sWmQyTDZKVXhPZ2tfMmZmY2otQjB0SGw4UDYxN0VRYVo5dFJURHM0S19xTnAwTnVPY1F2OUlPUkV3TjZtZ1BGYm01bUE3UUYzeGJwY09DSXFtMWpGV05Jb0Zod3pmR3MwOWw5RWRxbnBIb1c0ek1kLUNn; SIDCC=AFvIBn9vkj7KtyoNGPD1JwzADm6FohnE4qa_X0r7ItVt7X9ClwMFA3ZtU72HXol6U8-34pbV; __Secure-1PSIDCC=AFvIBn8qVafUjkA-yGvypQoE2JshYz6bgvEOKNJ6amdIU6FiU5QYYn6zSTbAEkE5rnpHiSpcUw; __Secure-3PSIDCC=AFvIBn9_mjzc3zw2D1xy-JyzYoEiIPQizuqNIalk87tYH-NUMOq3IncBsOLOopMMCGfwtANA6g";

function getIndex(str, char, n) {
  return str.split(char).slice(0, n).join(char).length;
}

const testFunc = async () => {
  let response;
  try {
    response = await axios.request({
      url: "https://www.youtube.com/",
      method: "get",
      headers: {
        Cookie: cookie,
      },
    });
    //   console.log(response.data);
  } catch (error) {
    console.error(error);
  }

  if (response && response.data) {
    const firstRecord = response.data.indexOf(`var ytInitialData`);
    const data = response.data.substring(firstRecord);
    const lastRecord = data.indexOf(`</script>`);

    const allRecordsString = data.substring(20, lastRecord - 1);

    const allRecordsJSON = JSON.parse(allRecordsString);

    const videoData =
      allRecordsJSON.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer
        .content.richGridRenderer.contents[3].richItemRenderer.content
        .videoRenderer;

    console.log(videoData.title.runs[0].text);
    console.log(videoData.navigationEndpoint.commandMetadata.webCommandMetadata.url);
    // other video url for hover over play? it plays it at half speed/chopped up so...
    // probably useful to emulate.
  }
};

testFunc();
