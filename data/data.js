let User = [
  {
    username: "adam",
    securities: [
      {
        ticker: "WIPRO",
        averagePrice: 412,
        holding: 150,
      },
      {
        ticker: "LT",
        averagePrice: 1318,
        holding: 20,
      },
    ],
  },
];

let trades = [
  {
    tradeID: "TX0005",
    ticker: "LT",
    type: "BUY",
    quantity: 10,
    timestamp: "1619854338803",
    price: 1200,
    username: "adam",
  },
  {
    tradeID: "TX0009",
    ticker: "LT",
    type: "BUY",
    quantity: 10,
    timestamp: "1619854453029",
    price: 1436,
    username: "adam",
  },
  {
    tradeID: "TX0001",
    ticker: "WIPRO",
    type: "BUY",
    quantity: 100,
    timestamp: "1619854050624",
    price: 400,
    username: "adam",
  },
  {
    tradeID: "TX0010",
    ticker: "WIPRO",
    type: "BUY",
    quantity: 50,
    timestamp: "1619854454624",
    price: 436,
    username: "adam",
  },
];

module.exports = {
  userCollection: User,
  tradeCollection: trades,
};
