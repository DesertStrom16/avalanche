const express = require("express");

const feedController = require("../controllers/channel");

const router = express.Router();

// GET /channel/fetchChannel
router.get("/fetchChannel", feedController.fetchChannel);

module.exports = router;