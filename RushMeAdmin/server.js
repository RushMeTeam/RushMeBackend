// File: start.controller.js
// Description: Express server currently used to just serve the static Angular content
"use strict";

var express    = require('express'),
    app        = express(),
    fs         = require('fs'),
    https       = require('https'),
    morgan     = require('morgan'),
    path       = require('path'),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    request = require('request'),
    jwt = require('jsonwebtoken'),
    jwkToPem = require('jwk-to-pem'),
    AWS = require('aws-sdk'),
    session = require('express-session'),
    authenticatedRoute = express.Router();

function validateAuth(req, res, next) {
      if (req.isAuthenticated()) { next(); } 
      else                       { res.redirect('/login'); }
  }

const CONSTANTS = {
  SUCCESS_CALLBACK_URL: 'https://127.0.0.1/in/success',
  CLIENT_DOMAIN: 'https://auth.rushme.app',
  CLIENT_ID: '4o9r7dvj3kiislsbh4cbhkf42',
  COG_POOL_ID : 'us-east-1_hp56TBp7o',
  CLIENT_SECRET: 'flcof5vnpr7m37q4dqm6muk9dl9spblugmdn1abkesjg5mo2k32',
  REGION: 'us-east-1'
};

const options = {
  callbackURL: CONSTANTS.SUCCESS_CALLBACK_URL,
  clientDomain: CONSTANTS.CLIENT_DOMAIN,
  clientID: CONSTANTS.CLIENT_ID,
  poolID : CONSTANTS.COG_POOL_ID,
  clientSecret: CONSTANTS.CLIENT_SECRET,
  region: CONSTANTS.REGION
};


app.use(session({
  secret: options.clientSecret, 
  saveUninitialized: false,
  resave: true, 
  cookie: {}
}));

app.use(passport.initialize());
app.use(passport.session());

const OAuth2CognitoStrategy = require('passport-oauth2-cognito');
var pems;
getPEMs();

function getPEMs() {
    request({
      url: `https://cognito-idp.${options.region}.amazonaws.com/${options.poolID}/.well-known/jwks.json`,
      json: true
    }, function (error, response, body) {
      if (!error && response.statusCode === 200) {
          pems = {};
          var keys = body['keys'];
          for(var i = 0; i < keys.length; i++) {
              //Convert each key to PEM
              var key_id = keys[i].kid;
              var modulus = keys[i].n;
              var exponent = keys[i].e;
              var key_type = keys[i].kty;
              var jwk = { kty: key_type, n: modulus, e: exponent};
              var pem = jwkToPem(jwk);
              pems[key_id] = pem;
          }
          //Now continue with validating the token
      } else {
          //Unable to download JWKs, fail the call
          console.log("Couldn't get PEMs");
      }
    });
}

passport.use(new OAuth2CognitoStrategy(options,
  function (accessToken, refreshToken, profile, done) {
    //Download the JWKs and save it as PEM
    if (!pems) { 
      done(null, null);
    }
    var decodedJwt = jwt.decode(accessToken, {complete: true});
    var kid = decodedJwt.header.kid;
    var pem = pems[kid];
    const payload = jwt.verify(accessToken, pem);
    const groups = payload['cognito:groups'] || [];
    done(null, { groups: groups, accessToken: accessToken }); // Keep accessToken for passing to API calls
  }));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/login', passport.authenticate('oauth2-cognito', {failureFlash:true}));
app.get('/in/success', passport.authenticate('oauth2-cognito'),
  (req,res) => res.redirect('/')
);

app.get('/logout', function(req, res){
  req.logout();
  // Invalidates the login token
  res.redirect(`https://auth.rushme.app/logout?response_type=token&client_id=${options.clientID}&redirect_uri=https://127.0.0.1/`)
});


AWS.config.loadFromPath('./config.json');
AWS.config.apiVersions = {
  dynamodb: 'latest'
}

var db = new AWS.DynamoDB();

app.get('/in/tables', validateAuth, function(req, res, next) {
  db.listTables(function(err, data) {
      console.log(data.TableNames);
    });
  res.send('AWS - See the console.');
})

// Logging to terminal currently, can log to a file
app.use(morgan('combined'));

// Setting the static content directory where everything will be accessed from
app.use(express.static(path.join(__dirname, 'app')));

// Body-parser is used to parse post requests. 'extended' will allow nested objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// This will send the index page when the root directory is accessed
app.get('/', function (req, res) {
  res.sendFile(__dirname +'/app/views/partials/home.html');
});

app.use('/in/*', validateAuth, function(req, res, next) {
  res.sendFile(__dirname +'/app/views/index.html');
});



// Sanity check to ensure the API is up
app.get('/isAppAvail', function(req,res){
  res.status(200).send("SUCCESS");
});

// Error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Uh oh! Something bad happened!');
});

// Listen on port 80
var httpPort = 443;
var httpsServer = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(httpPort);
console.log('Server running on port %s', httpPort);
