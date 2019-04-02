// File: start.controller.js
// Description: Express server currently used to just serve the static Angular content
"use strict";

var express = require('express'),
  app = express(),
  fs = require('fs'),
  http = require('http'),
  morgan = require('morgan'),
  path = require('path'),
  bodyParser = require('body-parser'),
  passport = require('passport'),
  request = require('request'),
  jwt = require('jsonwebtoken'),
  jwkToPem = require('jwk-to-pem'),
  AWS = require('aws-sdk'),
  session = require('express-session'),
  AmazonCognitoIdentity = require('amazon-cognito-identity-js'),
  authenticatedRoute = express.Router();



require('dotenv').load();

const OAuth2CognitoStrategy = require('passport-oauth2-cognito');

const CONSTANTS = {
  callbackURL: process.env.SUCCESS_CALLBACK_URL,
  clientDomain: process.env.CLIENT_DOMAIN,
  clientID: process.env.CLIENT_ID,
  poolID: process.env.COG_POOL_ID,
  clientSecret: process.env.CLIENT_SECRET,
  region: process.env.REGION
};

const logoutRedirect = `https://auth.rushme.app/logout?response_type=token&client_id=${CONSTANTS.clientID}&redirect_uri=${process.env.LOGOUT_REDIRECT_URL}`;

app.use(session({
  secret: CONSTANTS.clientSecret,
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
app.use(express.static('resources/**'));

// Body-parser is used to parse post requests. 'extended' will allow nested objects
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// AWS Configuration
AWS.config.apiVersions = {
  dynamodb: 'latest'
}

function getPEMs(done) {
  var pems;
  request({
    url: `https://cognito-idp.${CONSTANTS.region}.amazonaws.com/${CONSTANTS.poolID}/.well-known/jwks.json`,
    json: true
  }, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      pems = {};
      let keys = body['keys'];
      for (let i = 0; i < keys.length; i++) {
        //Convert each key to PEM
        let key_id = keys[i].kid;
        let modulus = keys[i].n;
        let exponent = keys[i].e;
        let key_type = keys[i].kty;
        let jwk = { kty: key_type, n: modulus, e: exponent };
        let pem = jwkToPem(jwk);
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

passport.use(new OAuth2CognitoStrategy(CONSTANTS,
  function (accessToken, refreshToken, profile, done) {
    //Download the JWKs and save it as PEM
    getPEMs(function (err, pems) {
      if (err) {
        console.log('error', err.message, err.stack);
        return;
      }

      let decodedJwt = jwt.decode(accessToken, { complete: true });
      let kid = decodedJwt.header.kid;
      var pem = pems[kid];
      const payload = jwt.verify(accessToken, pem);
      const groups = payload['cognito:groups'] || [];

      done(null, { groups: groups, accessToken: accessToken }); // Keep accessToken for passing to API calls
    });
  }));

app.get('/login', passport.authenticate('oauth2-cognito'));
app.get('/in/success', passport.authenticate('oauth2-cognito'),
  (req, res) => res.redirect('/dashboard/')
);

function validateAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
}
var cognitoIdentityProvider = new AWS.CognitoIdentityServiceProvider();

function validateAPI(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).send({ message: "Please ensure you are logged in before trying to do that!" })
  }
}

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/app/views/public.html');
});

app.get('/dashboard/', validateAuth, function (req, res) {
  res.sendFile(__dirname + '/app/views/portal.html');
});

app.get('/logout', function (req, res) {
  req.logout();
  // Invalidates the login token
  res.redirect(logoutRedirect)
});

/*
    DynamoDB
*/
// This endpoint is left here for a sanity check when working with the DynamoDB
var db = new AWS.DynamoDB();
app.get('/in/tables', validateAPI, function (req, res) {
  db.listTables(function (err, data) {
    console.log(data.TableNames);
    res.status(200).send('AWS - See the console.');
  });
});

//Endpoint to get all the fraternities from the DynamoDB
let documentClient = new AWS.DynamoDB.DocumentClient();
app.get('/in/fraternities', validateAPI, function (req, res) {
  let params = {
    TableName: 'FraternityInfo'
  };

  documentClient.scan(params, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data.Items);
    }
  });
});
app.get('/in/fraternities/:namekey', validateAPI, function (req, res) {
  let params = {
    TableName: 'FraternityInfo',
    NameKey: req.params.namekey
  };

  documentClient.scan(params, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data.Items);
    }
  });
});

//Endpoint to get all the events from the DynamoDB
app.get('/in/events', validateAPI, function (req, res) {
  let params = {
    TableName: 'EventInfo'
  };

  documentClient.scan(params, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(data.Items);
    }
  });
});

//Endpoint to get a fraternity from the DynamoDB
app.post('/in/events/:namekey', validateAPI, function (req, res) {
  if (req.params.namekey != req.body.namekey) {
    res.status(500).send("MISMATCHED namekeys!");
  }
  // TODO: VALIDATE!!! Ensure they have the permissions.
  let params = {
    TableName: 'FraternityInfo',
    Key: {
      "namekey": req.params.namekey,
    },
    UpdateExpression: "set #frat_name = :n, description = :d",
    ExpressionAttributeNames: {
      "#frat_name": "name"
    },
    ExpressionAttributeValues: {
      ":d": req.body.description,
      ":n": req.body.name
    }
  };

  documentClient.update(params, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200);
    }
  });
});


/*
    Cognito User Management
*/

// Sign up a user
app.post('/in/users/signup/:scope/:group/:email', validateAPI,
  function (req, res) {
    // TODO: Allow signup
    let params = {
      UserPoolId: CONSTANTS.UserPoolId, /* required */
      Username: req.params.email, /* required */
      DesiredDeliveryMediums: [
        EMAIL
      ],
      MessageAction: RESEND | SUPPRESS,
      UserAttributes: [
        {
          Name: 'email',
          Value: req.params.email
        },
        {
          Name: 'scope', /* required */
          Value: req.params.scope || 'TODO'
        },
        {
          Name: 'role', /* required */
          Value: 'TODO'
        },
        {
          Name: 'group', /* required */
          Value: req.params.group || 'ZZZ'
        }
        /* more items */
      ]
    };
    cognitoIdentityProvider.adminCreateUser(params, function(err, data) {
      if (err) res.status(500).send(err.stack); // an error occurred
      else     res.status(200).send(data);      // successful response
    });
  });

// Remove user permission
app.post('/in/users/:email/removepermssions', validateAPI,
  function (req, res) {
    // TODO: Allow remove user permission
  });

// Add user permission
app.post('/in/users/:email/addpermission/:permission', validateAPI,
  function (req, res) {
    // TODO: Allow add user permission
  });

// function isUserInGroup(req, group, done) {
//   cognitoIdentityProvider.getUser({
//     AccessToken: req.user.accessToken
//   }, function(err, data) {
//     if (err) return done(null,null); // an error occurred
//     else     return done(null, {group: req.user.group});
//   });
// }

app.get('/in/users/current', validateAPI,
  function (req, res) {
    cognitoIdentityProvider.getUser({
      AccessToken: req.user.accessToken
    }, function (err, data) {
      let user = {};
      let attrs = data.UserAttributes;
      for (let i = 0; i < attrs.length; i++) {
        if (attrs[i].Name == "email") {
          user.email = attrs[i].Value
        }
      }
      if (err) res.status(500).send(err); // an error occurred
      else     res.status(200).json(user); // successful response
    });
  });
app.get('/in/users/current/groups', validateAPI,
  function (req, res) {
    res.status(200).json(req.user.groups);
  });
app.get('/in/users/current/committee/', validateAPI,
<<<<<<< HEAD
function(req, res) {
  cognitoIdentityProvider.listUsersInGroup({
    GroupName: req.user.groups[0], /* required */
    UserPoolId: CONSTANTS.poolID /* required */
  }, function(err, data) {
    var users = [];
    var i = 0;
    for (var i = 0; data.Users.length != null && i < data.Users.length; i++){
      var u = {};
      var attrs = data.Users[i].Attributes;
      for (var j = 0; j < attrs.length; j++) {
        if (attrs[j].Name = "email") {
          u.email = attrs[j].Value
=======
  function (req, res) {
    cognitoIdentityProvider.listUsersInGroup({
      GroupName: req.user.groups[0], /* required */
      UserPoolId: CONSTANTS.poolID /* required */
    }, function (err, data) {
      let users = [];
      let i = 0;
      for (let i = 0; i < data.Users.length; i++) {
        let u = {};
        let attrs = data.Users[i].Attributes;
        for (let j = 0; j < attrs.length; j++) {
          if (attrs[j].Name = "email") {
            u.email = attrs[j].Value
          }
>>>>>>> 829ccbfe9ae17af10f347ae58ec6203064598a4e
        }
        users.push(u);
      }
      if (err) console.log(err, err.stack); // an error occurred
      else res.status(200).json(users);  // successful response
    });
  });

app.get('/in/users/by/:group', validateAPI,
  function (req, res) {
    cognitoIdentityProvider.listUsersInGroup({
      GroupName: req.user.groups[0], /* required */
      UserPoolId: CONSTANTS.poolID /* required */
    }, function (err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else res.status(200).json(data);  // successful response
    });
  })

// Get user by email
app.get('/in/users/by/:email', validateAPI,
  function (req, res) {
    cognitoIdentityProvider.listUsers({
      UserPoolId: CONSTANTS.poolID, /* required */
      AttributesToGet: [], // get all items
      Filter: 'email = \"' + req.params.email + "\"",
      Limit: 0,
    }, function (err, data) {
      if (err) res.status(500).send(err);
      else res.status(200).json(data);
    })
  });



// Sanity check to ensure the API is up
app.get('/isAppAvail', function (req, res) {
  res.status(200).send("SUCCESS");
});

// Error handling
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Uh oh! Something bad happened!');

});

var httpPort = process.env.PORT || 80;
var httpServer = http.createServer(app);
httpServer.listen(httpPort);
