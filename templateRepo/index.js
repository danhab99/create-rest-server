require("dotenv").config()

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);

const app = express()

app.use(session({
  secret: process.env.COOKIE_SECRET,
  resave: true,
  unset: 'destroy',
  saveUninitialized: false,
  rolling: true,
  cookie: { 
    secure: false, 
    maxAge: 6.048e+8, // 1 week
    domain: process.env.DOMAIN
  },
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use('/', require('./route/index.js'))

mongoose.connection.on("connecting", () =>
  console.warn(`Connecting to database @ ${process.env.MONGO_SRV}`)
);

mongoose.connection.on("error", err =>
  console.error("mongoose connection", err)
);

mongoose.connection.on("close", () => {
  console.warn("Database closed, shutting down");
  process.exit(1);
});

mongoose.connection.on("open", () => {
  console.log("Mongo database open")
  app.listen(process.env.PORT, '0.0.0.0', () => console.log(`Listening on port ${process.env.PORT}`))
});

mongoose.connect(process.env.MONGO_SRV,
  { useNewUrlParser: true, useUnifiedTopology: true }
);