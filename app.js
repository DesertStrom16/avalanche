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

  // Start Puppeteer Browser
  const browser = await puppeteer.launch({ headless: false });
  let paginatePage;

  // First paginated results
  socket.on("getPaginateSearch", async (query) => {
    console.log("SOCKET ON: getPaginateSearch");

    paginatePage = await browser.newPage();
    await paginatePage.goto(
      `https://www.youtube.com/results?search_query=${query}`,
      {
        waitUntil: "networkidle2",
      }
    );
    await paginatePage.mouse.move(100, 100);

    paginateSearchHandler(paginatePage, socket);
  });

  // Continued paginated results
  socket.on("continuePaginateSearch", async (query) => {
    console.log("SOCKET ON: continuePaginateSearch");

    paginateSearchHandler(paginatePage, socket);
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
    await browser.close();
  });
});

console.log("----------------------");
console.log(`Listening on Port ${PORT}`);
