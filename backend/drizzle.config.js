const path = require("path");

module.exports = {
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.DB_PATH
      ? path.resolve(process.env.DB_PATH)
      : path.resolve(__dirname, "src", "db", "plants.db"),
  },
  out: "./drizzle",
  schema: "./src/db/schema.js",
};
