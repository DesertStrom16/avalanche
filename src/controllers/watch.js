const axios = require("axios");
const {
  initialSearchResponseParser,
  videoParser,
} = require("../functions/parseHandler");

exports.fetchRecommended = async (req, res, next) => {
  const videoId = req.query.v;

  await axios
    .get(`https://www.youtube.com/watch?v=${videoId}`)
    .then(function (response) {
      const data = response.data;
      if (data) {
     
        let firstRenderer = data.indexOf("compactVideoRenderer");
        let firstRenderString = data.substring(firstRenderer)
        let realEnd = firstRenderString.lastIndexOf("compactVideoRenderer")
        let finalString = firstRenderString.substring(0, realEnd - 3);

        res.json({ data: finalString });
        console.log(finalString)
      
        // let beginning = data.indexOf("responseContext");
        // let firstString = data.substring(beginning - 2);
        // let end = firstString.indexOf("</script>");
        // let finalString = firstString.substring(0, end - 1);
        // let stringToJson = JSON.parse(finalString);

        // res.json({ data: stringToJson });
        // console.log(resObj)
        // if (resObj && resObj.content && resObj.content.content?.length > 0) {
        //   res.json({ ...resObj });
        // } else {
        //   res.sendStatus(500);
        // }
      }
    })
    .catch(function (error) {
      next(error);
    });
};
