const express = require("express");

const feedController = require("../controllers/main");

const router = express.Router();

// GET /main/fetch
router.get("/fetch", feedController.fetch);

module.exports = router;
