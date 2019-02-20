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
    authenticatedRoute = express.Router();

app.use(passport.initialize());
app.use(passport.session());

const OAuth2CognitoStrategy = require('passport-oauth2-cognito');
var user = null;
const options = {
  callbackURL: 'https://127.0.0.1/in/dashboard',
  clientDomain: 'https://auth.rushme.app',
  clientID: '4o9r7dvj3kiislsbh4cbhkf42',
  clientSecret: 'flcof5vnpr7m37q4dqm6muk9dl9spblugmdn1abkesjg5mo2k32',
  region: 'us-east-1'
};
passport.use(new OAuth2CognitoStrategy(options, verify));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

function verify(accessToken, refreshToken, profile, done) {
  if (profile) {
    user = profile;
    return done(null, user);
  } else {
    return done(null, false);
  }
}

app.get('/in/', passport.authenticate('oauth2-cognito'));
app.get('/in/dashboard',passport.authenticate('oauth2-cognito'),
(req,res) => res.sendFile(__dirname +'/app/in/views/dashboard.html'));

app.get('/in/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Logging to terminal currently, can log to a file
app.use(morgan('combined'));

// Setting the static content directory where everything will be accessed from
app.use(express.static(path.join(__dirname, 'app')));

// Body-parser is used to parse post requests. 'extended' will allow nested objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// This will send the index page when the root directory is accessed
app.get('/', function (req, res) {
  res.sendFile(__dirname +'/app/views/index.html');
});

// Sanity check to ensure the API is up
app.get('/isAppAvail', function(req,res){
  res.status(200).send("SUCCESS");
});

// Error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

// Listen on port 80
var httpPort = 443;
var httpsServer = https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(httpPort);
console.log('Server running on port %s', httpPort);
