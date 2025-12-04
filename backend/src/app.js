const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const plantRoutes = require("./routes/plantRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(
  "/images",
  express.static(path.join(__dirname, "..", "public", "plantImages"))
);
app.use(
  "/icons",
  express.static(path.join(__dirname, "..", "public", "icons"))
);

app.use("/api", plantRoutes);

module.exports = app;
