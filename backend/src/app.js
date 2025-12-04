const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const plantRoutes = require("./routes/plantRoutes");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// API Prefix
app.use("/api", plantRoutes);

module.exports = app;
