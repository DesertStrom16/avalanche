const express = require("express");

const feedController = require("../controllers/home");

const router = express.Router();

// GET /home/fetchHome
router.get("/fetchHome", feedController.fetchHome);

// POST /home/postHomeContinuation
router.post("/postHomeContinuation", feedController.postHomeContinuation);

module.exports = router;
