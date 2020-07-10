const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const methodOverride = require("method-override");

const app = express();
const middlewares = require("./middlewares");
const events = require("./Components/Events/eventsAPI");
const users = require("./Components/Users/usersAPI");

app.use(methodOverride("_method"));
app.use(morgan("common"));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected.."))
  .catch((err) => console.log(err));

// Events router
app.use("/api/events", events);

// User router
app.use("/api/user", users);

//Error handlers
app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
