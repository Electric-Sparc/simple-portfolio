const express = require("express");
const trades = require("./routes/trades");

const app = express();

let port = process.env.PORT || 8080;
app.listen(port);

app.use(express.json());
app.use("/api", trades);

app.get("/", function (req, res) {
  console.log("ho");
  res.status(200).send("hi");
});

app.listen(port);
