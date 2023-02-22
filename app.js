require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const puppeteer = require("puppeteer");
const { paginateSearchHandler } = require("./src/functions/searchHandler");

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

// Set Routes
app.use("/main", mainRoute);

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT);

const io = require("./socket").init(server);
app.set("io", io);

io.on("connection", async (socket) => {
  app.set("socket", socket);
  console.log("Client Connected");

  let paginatePage;

  // Prepare paginate page
  socket.on("preparePaginateSearch", async (query) => {
    console.log("SOCKET ON: preparePaginateSearch");
    // paginatePage = app.get("paginatePage");
    paginatePage = app.get("paginatePage");
    await paginatePage.waitForNavigation({ waitUntil: 'networkidle0' })
    console.log("COMPLETED LOADING")
    // await paginatePage.mouse.move(20, 20);
  });

  // Don't need seperate ones now??

  // First paginated results
  socket.on("getPaginateSearch", async (query) => {
    console.log("SOCKET ON: getPaginateSearch");
    paginatePage = app.get("paginatePage");
    console.log(paginatePage)

    let isLoadingCompleted = app.get("paginateLoadingComplete");
    console.log(isLoadingCompleted);
    if (isLoadingCompleted) {
      await paginatePage.mouse.move(20, 20);

      paginateSearchHandler(paginatePage, socket);
      app.set("paginateLoadingComplete", false);
    } else {
      // Wait for Page Idle
      await paginatePage.waitForNetworkIdle();
        console.log("IDLE");

        await paginatePage.mouse.move(20, 20);
  
        paginateSearchHandler(paginatePage, socket);
        app.set("paginateLoadingComplete", false);
    }
  });

  // Continued paginated results
  socket.on("continuePaginateSearch", async (query) => {
    console.log("SOCKET ON: continuePaginateSearch");

    paginateSearchHandler(paginatePage, socket);
  });

  // RTK Query Test
  socket.on("startTest", async (query) => {
    console.log("SOCKET ON: startTest");
    socket.emit("streamingTest", { txt: "hey there" });
  });

  // Close paginated results
  socket.on("closePaginateSearch", async (query) => {
    console.log("SOCKET ON: closePaginateSearch");

    if (paginatePage) {
      await paginatePage.close();
    }
  });

  // On Disconnect
  socket.on("disconnect", async (reason) => {
    console.log("Client Disconnected");
    app.set("paginateLoadingComplete", false);
    app.set("paginatePage", undefined);
    let browser = app.get("browser");
    if (browser) {
      await browser.close();
      app.set("browser", undefined);
    }
  });
});

console.log("----------------------");
console.log(`Listening on Port ${PORT}`);
