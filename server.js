const express = require("express");
const bodyParser = require("body-parser");
var expressValidator = require('express-validator');
var commonConfig = require('./app/config/common_config.json');

// create express app
const app = express();
app.use(expressValidator());
app.use(express.static('public'));
app.use(function (req, res, next) {
  
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

    // check for basic auth header
  if (!req.headers.authorization || req.headers.authorization.indexOf(commonConfig.AUTHORIZATION_KEY) === -1) {
     return res.json({ status:0, message: 'Invaid authorization header' });
  }

  next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

require("./app/routes/index.routes.js")(app);

// listen for requests
app.listen(9001, () => {
  console.log("Server is listening on port 9001");
});
