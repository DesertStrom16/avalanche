const express = require("express");

const feedController = require("../controllers/main");

const router = express.Router();

// GET /main/fetchAutoSearch
router.get("/fetchAutoSearch", feedController.fetchAutoSearch);

// GET /main/fetchSearch
router.get("/fetchSearch", feedController.fetchSearch);

// GET /main/fetchSearchPaginate
router.get("/fetchSearchPaginate", feedController.fetchSearchPaginate);

module.exports = router;
