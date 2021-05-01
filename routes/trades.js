const express = require("express");
const data = require("../data/data");
const router = express.Router();

let tradeID = 100;

let users = data.userCollection;
let trades = data.tradeCollection;

function validPortfolio(username) {
  return users.filter((object) => object.username === username);
}

function updateSecurities(trade) {
  let tradeType = 2;
  let portfolio = validPortfolio(trade.username);
  portfolio[0].securities.map((security) => {
    if (security.ticker === trade.ticker) {
      if (trade.type === "SELL" && trade.quantity > security.holding) {
        tradeType = 0;
      } else if (trade.type === "BUY") {
        security.averagePrice =
          (trade.price * trade.quantity +
            security.averagePrice * security.holding) /
          (trade.quantity + security.holding);
        security.holding = trade.quantity + security.holding;
        tradeType = 1;
      } else {
        security.holding = security.holding - trade.quantity;
        tradeType = 1;
      }
    }
  });
  if (tradeType === 2) {
    if (trade.type === "SELL") {
      return false;
    }
    let newSecurity = {
      ticker: trade.ticker,
      averagePrice: trade.price,
      holding: trade.quantity,
    };
    portfolio[0].securities.push(newSecurity);
  }
  if (tradeType === 0) return false;
  return true;
}

router.get("/portfolio/:username", function (req, res) {
  let portfolio = validPortfolio(req.params.username);
  if (portfolio.length === 0)
    return res
      .status(400)
      .send("No portfolio present for the provided username.");
  portfolio[0].securities = portfolio[0].securities.filter(
    (security) => security.holding !== 0
  );
  res.status(200).send(portfolio[0].securities);
});

router.get("/trades/:username", function (req, res) {
  let portfolio = validPortfolio(req.params.username);
  if (portfolio.length === 0)
    return res
      .status(400)
      .send("No portfolio present for the provided username.");
  let userTrades = trades.filter(
    (trade) => trade.username === req.params.username
  );
  if (userTrades.length) return res.status(200).send(userTrades);
  res.status(404).send("No trades found.");
});

router.get("/returns/:username", function (req, res) {
  let returns = 0;
  let portfolio = validPortfolio(req.params.username);

  if (portfolio.length === 0)
    return res.status(404).send("No portfolio found.");

  portfolio[0].securities.forEach((ticker) => {
    returns = returns + (100 - ticker.averagePrice) * ticker.holding;
  });

  res.send({ PnL: returns });
});

router.post("/trades/:username", function (req, res) {
  let portfolio = validPortfolio(req.params.username);

  if (portfolio.length === 0)
    return res
      .status(400)
      .send("No portfolio present for the provided username.");

  let trade = {
    tradeID: "TX0" + tradeID,
    ticker: req.body.ticker,
    type: req.body.type,
    quantity: req.body.quantity,
    timestamp: Date.now(),
    price: req.body.price,
    username: req.params.username,
  };
  if (!updateSecurities(trade))
    return res.status(401).send("Can't sell more than your holdings.");

  trades.push(trade);
  tradeID += 1;
  res
    .status(200)
    .send("Trade placed successfully with Trade ID TX0" + tradeID - 1);
});

router.put("/trades/:username/:id", function (req, res) {
  const trade = trades.find(
    (t) => t.tradeID === req.params.id && t.username === req.params.username
  );
  if (!trade) return res.status(404).send("Trade with the given id not found.");
  let tradeType = trade.type === "BUY" ? "SELL" : "BUY";
  let modifiedTrade = {
    tradeID: trade.tradeID,
    ticker: trade.ticker,
    type: tradeType,
    quantity: trade.quantity,
    price: trade.price,
    username: trade.username,
  };
  updateSecurities(modifiedTrade);
  Object.keys(req.body).map((key) => (trade[key] = req.body[key]));
  if (!updateSecurities(trade))
    return res.status(401).send("Can't sell more than your holdings.");
  res
    .status(200)
    .send("Trade with Trade ID TX0" + tradeID + " modified successfully");
});

router.delete("/trades/:username/:id", function (req, res) {
  const trade = trades.find(
    (t) => t.tradeID === req.params.id && t.username === req.params.username
  );
  if (!trade) return res.status(404).send("Trade with the given id not found.");
  let tradeType = trade.type === "BUY" ? "SELL" : "BUY";
  let modifiedTrade = {
    tradeID: trade.tradeID,
    ticker: trade.ticker,
    type: tradeType,
    quantity: trade.quantity,
    price: trade.price,
    username: trade.username,
  };
  updateSecurities(modifiedTrade);
  const index = trades.indexOf(trade);
  trades.splice(index, 1);
  res
    .status(200)
    .send("Trade with Trade ID TX0" + tradeID + " deleted successfully");
});

router.post("/portfolio/create", function (req, res) {
  const user = users.find((u) => u.username === req.body.username);
  if (user)
    return res.send(
      "Username already exists. Please try again with different username."
    );
  let newUser = {
    username: req.body.username,
    securities: [],
  };
  users.push(newUser);
  res.send("Portfolio created with username " + newUser.username);
});

module.exports = router;
