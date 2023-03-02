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
const { videoParser } = require("./src/functions/parseHandler");

// Set Routes
app.use("/main", mainRoute);

const PORT = process.env.PORT || 8000;

// ---- Uninstall Puppeteer and Cheerio ----
app.listen(PORT);

console.log("----------------------");
console.log(`Listening on Port ${PORT}`);
