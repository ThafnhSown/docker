const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
require("dotenv").config();

// init middleware
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// init database
require("./database/init.mongodb");

app.use("/", require("./routes"));
app.get("/", (req,res) => {
  res.send("son da test docker")
})

// handle error
app.use((req, res, next) => {
  const error = new Error("Cannot connect to this route");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 501;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
