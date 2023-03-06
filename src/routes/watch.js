const express = require("express");

const feedController = require("../controllers/watch");

const router = express.Router();

// GET /watch/fetchRecommended
router.get("/fetchRecommended", feedController.fetchRecommended);

module.exports = router;
