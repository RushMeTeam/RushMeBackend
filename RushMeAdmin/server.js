// File: start.controller.js
// Description: Express server currently used to just serve the static Angular content
"use strict";

var express    = require('express'),
    app        = express(),
    fs         = require('fs'),
    https      = require('https'),
    morgan     = require('morgan'),
    path       = require('path'),
    bodyParser = require('body-parser'),
    passport   = require('passport'),
    request    = require('request'),
    jwt        = require('jsonwebtoken'),
    jwkToPem   = require('jwk-to-pem'),
    AWS        = require('aws-sdk'),
    session    = require('express-session'),
    authenticatedRoute = express.Router();

const OAuth2CognitoStrategy = require('passport-oauth2-cognito');

/* Move site constants into an environmental file in the future. */
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

const logoutRedirect = `https://auth.rushme.app/logout?response_type=token&client_id=${options.clientID}&redirect_uri=https://127.0.0.1/#!/bye`;

app.use(session({
  secret: options.clientSecret,
  saveUninitialized: false,
  resave: true,
  cookie: {}
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Logging to terminal currently, can log to a file
app.use(morgan('combined'));

// Setting the static content directory where everything will be accessed from
app.use(express.static(path.join(__dirname, 'app')));

// Body-parser is used to parse post requests. 'extended' will allow nested objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// AWS Configuration
AWS.config.loadFromPath('./config.json');
AWS.config.apiVersions = {
  dynamodb: 'latest'
}

function getPEMs(done) {
  var pems;
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
      
      return done(null, pems);

      //Now continue with validating the token
    } else {
      //Unable to download JWKs, fail the call
      return done(Error("Couldn't get PEMs"));
    }
  });
}

passport.use(new OAuth2CognitoStrategy(options,
  function (accessToken, refreshToken, profile, done) {
    //Download the JWKs and save it as PEM
    getPEMs(function(err, pems){
      if(err){
        console.log ('error', err.message, err.stack);
        return;
      }
      
      var decodedJwt = jwt.decode(accessToken, {complete: true});
      var kid = decodedJwt.header.kid;
      var pem = pems[kid];
      const payload = jwt.verify(accessToken, pem);
      const groups = payload['cognito:groups'] || [];
      done(null, { groups: groups, accessToken: accessToken }); // Keep accessToken for passing to API calls
    });
  }));

app.get('/login', passport.authenticate('oauth2-cognito'));
app.get('/in/success', passport.authenticate('oauth2-cognito'), 
  (req,res) => res.redirect('/dashboard/')
);

function validateAuth(req, res, next) {
  if (req.isAuthenticated()) { 
    next();
  } else { 
    //This was redirecting to /bye but I think it should redirect to index. Change this back if you disagree.
    res.redirect('/');
  }
}

function validateAPI(req, res, next){
  if (req.isAuthenticated()) { 
    next();
  } else {
    res.status(401).send({message: "Please ensure you are logged in before trying to do that!"})
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname +'/app/views/homepage.html');
});

app.get('/dashboard/', validateAuth, function (req, res) {
  res.sendFile(__dirname +'/app/views/index.html');
});

app.get('/logout', function(req, res){
  req.logout();
  // Invalidates the login token
  res.redirect(logoutRedirect)
});

// This endpoint is left here for a sanity check when working with the DynamoDB
var db = new AWS.DynamoDB();
app.get('/in/tables', validateAPI, function(req, res) {
  db.listTables(function(err, data) {
    console.log(data.TableNames);
    res.status(200).send('AWS - See the console.');
  });
});

//Endpoint to get all the fraternaties from the DynamoDB
var documentClient = new AWS.DynamoDB.DocumentClient();
app.get('/in/fraternaties', validateAPI, function(req, res) {
  var params = {
    TableName: 'FraternityInfo'
  };
  
  documentClient.scan(params, function(err, data) {
    if (err){
      res.status(500).send(err);
    } else {
      res.status(200).send(data.Items);
    }
  });
});

//Endpoint to get all the fraternaties from the DynamoDB
app.get('/in/events', validateAPI, function(req, res) {
  var params = {
    TableName: 'EventInfo'
  };
  
  documentClient.scan(params, function(err, data) {
    if (err){  
      res.status(500).send(err);
    } else {
      res.status(200).send(data.Items);
    }
  });
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
var httpsPort = 443;
var httpsServer = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(httpsPort);
console.log('Server running on port %s', httpsPort);
