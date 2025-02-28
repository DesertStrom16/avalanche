require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

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
const homeRoute = require("./src/routes/home");
const watchRoute = require("./src/routes/watch");
const channelRoute = require("./src/routes/channel");

// Set Routes
app.use("/main", mainRoute);
app.use("/home", homeRoute);
app.use("/watch", watchRoute);
app.use("/channel", channelRoute);

// ---- Uninstall Puppeteer and Cheerio ----
app.listen(process.env.PORT);

console.log("----------------------");
console.log(`Listening on Port ${process.env.PORT}`);
