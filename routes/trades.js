const express = require("express");
const controller = require("../controllers/controllerFunctions");
const router = express.Router();

router.get("/:username", function (req, res) {
  controller.getTrades(req, res);
});

router.post("/:username", function (req, res) {
  controller.addTrade(req, res);
});

router.put("/:username/:id", function (req, res) {
  controller.updateTrade(req, res);
});

router.delete("/:username/:id", function (req, res) {
  controller.deleteTrade(req, res);
});

module.exports = router;
