require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const axios = require("axios");

const app = express();

app.use(morgan("tiny")); // Logger
app.use(bodyParser.json()); // application/json

// Set Headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.get("/favicon.ico", (req, res) => res.status(204));

// Routes Import
const mainRoute = require("./src/routes/main");
const { videoParser } = require("./src/functions/parseHandler");

// Set Routes
app.use("/main", mainRoute);

const PORT = process.env.PORT || 8000;

// ---- Uninstall Puppeteer and Cheerio ----
const server = app.listen(PORT);

const io = require("./socket").init(server);
app.set("io", io);

io.on("connection", async (socket) => {
  console.log("Client Connected");
  app.set("socket", socket);

  // Paginate Search Results
  socket.on("getPaginateSearch", async ({ client, token, key }) => {
    console.log("SOCKET ON: getPaginateSearch");

    // ---- Still need cookies??? ----

    await axios
      .post(
        `https://www.youtube.com/youtubei/v1/search?key=${key}&prettyPrint=false`,
        { continuation: token, context: { client: client } }
      )
      .then(function (response) {
        const data = response.data;
        if (data) {
          let newToken =
            data.onResponseReceivedCommands[0].appendContinuationItemsAction
              .continuationItems[1].continuationItemRenderer
              .continuationEndpoint.continuationCommand.token;

          let newContent =
            data.onResponseReceivedCommands[0].appendContinuationItemsAction
              .continuationItems[0].itemSectionRenderer.contents;

          let contentParsed = videoParser(newContent);

          socket.emit("paginateSearchReponse", {
            token: newToken,
            content: contentParsed,
          });

          // let resObj = initialSearchResponseParser(resData);
          // if (resObj && resObj.content.length > 0) {
          //   res.json(resObj);
          // } else {
          //   res.sendStatus(500);
          // }
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  });

  // On Disconnect
  socket.on("disconnect", (reason) => {
    console.log("Client Disconnected");
  });
});

console.log("----------------------");
console.log(`Listening on Port ${PORT}`);
