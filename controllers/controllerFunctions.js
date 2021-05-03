const data = require("../data/data");

let tradeID = 100;

let users = data.userCollection;
let trades = data.tradeCollection;

// common functions

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

// GET request controllers

// portfolio
function getPortfolio(request, response) {
  let portfolio = validPortfolio(request.params.username);
  if (portfolio.length === 0)
    return response
      .status(400)
      .send("No portfolio present for the provided username.");
  portfolio[0].securities = portfolio[0].securities.filter(
    (security) => security.holding !== 0
  );
  return response.status(200).send(portfolio[0].securities);
}

// trades
function getTrades(request, response) {
  let portfolio = validPortfolio(request.params.username);
  if (portfolio.length === 0)
    return response
      .status(400)
      .send("No portfolio present for the provided username.");
  let userTrades = trades.filter(
    (trade) => trade.username === request.params.username
  );
  if (userTrades.length) return response.status(200).send(userTrades);
  return response.status(404).send("No trades found.");
}

// returns
function getReturns(request, response) {
  let returns = 0;
  let portfolio = validPortfolio(request.params.username);

  if (portfolio.length === 0)
    return response.status(404).send("No portfolio found.");

  portfolio[0].securities.forEach((ticker) => {
    returns = returns + (100 - ticker.averagePrice) * ticker.holding;
  });

  return response.send({ PnL: returns });
}

// POST request controllers

// add trade
function addTrade(request, response) {
  let portfolio = validPortfolio(request.params.username);

  if (portfolio.length === 0)
    return response
      .status(400)
      .send("No portfolio present for the provided username.");

  let trade = {
    tradeID: "TX0" + tradeID,
    ticker: request.body.ticker,
    type: request.body.type,
    quantity: request.body.quantity,
    timestamp: Date.now(),
    price: request.body.price,
    username: request.params.username,
  };
  if (!updateSecurities(trade))
    return response.status(401).send("Can't sell more than your holdings.");

  trades.push(trade);
  tradeID += 1;
  return response
    .status(200)
    .send(`Trade placed successfully with Trade ID TX0${tradeID - 1}`);
}

// add user portfolio

function createUserPortfolio(request, response) {
  const user = users.find((u) => u.username === request.body.username);
  if (user)
    return response.send(
      "Username already exists. Please try again with different username."
    );
  let newUser = {
    username: request.body.username,
    securities: [],
  };
  users.push(newUser);
  return response.send("Portfolio created with username " + newUser.username);
}

// DELETE request controller

// delete trade
function deleteTrade(request, response) {
  const trade = trades.find(
    (t) =>
      t.tradeID === request.params.id && t.username === request.params.username
  );
  if (!trade)
    return response.status(404).send("Trade with the given id not found.");
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
  return response
    .status(200)
    .send("Trade with Trade ID " + trade.tradeID + " deleted successfully");
}

// PUT requests controller

// update trade

function updateTrade(request, response) {
  const trade = trades.find(
    (t) =>
      t.tradeID === request.params.id && t.username === request.params.username
  );
  if (!trade)
    return response.status(404).send("Trade with the given id not found.");
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
  Object.keys(request.body).map((key) => (trade[key] = request.body[key]));
  if (!updateSecurities(trade))
    return response.status(401).send("Can't sell more than your holdings.");
  response
    .status(200)
    .send("Trade with Trade ID " + trade.tradeID + " modified successfully");
}

module.exports = {
  createUserPortfolio,
  getPortfolio,
  getReturns,
  getTrades,
  addTrade,
  deleteTrade,
  updateTrade,
};
