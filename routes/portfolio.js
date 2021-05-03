const express = require("express");
const controller = require("../controllers/controllerFunctions");
const router = express.Router();

// create new user portfolio
router.post("/portfolio/create", function (req, res) {
  controller.createUserPortfolio(req, res);
});

// fetch user portfolio
router.get("/portfolio/:username", function (req, res) {
  controller.getPortfolio(req, res);
});

// fetch returns
router.get("/returns/:username", function (req, res) {
  controller.getReturns(req, res);
});

module.exports = router;
