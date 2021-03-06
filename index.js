const express = require("express");
const trades = require("./routes/trades");
const portfolio = require("./routes/portfolio");

const app = express();

let port = process.env.PORT || 5000;
app.listen(port);

app.use(express.json());
app.use("/api/trades", trades);
app.use("/api/", portfolio);

app.get("/", function (req, res) {
  console.log("ho");
  res.status(200).send("hi");
});
