// "use strict";

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
var cognitoIdentityProvider = new AWS.CognitoIdentityServiceProvider();

function validateAuth(req, res, next) {
  if (req.isAuthenticated()) {
    cognitoIdentityProvider.getUser({
      AccessToken: req.user.accessToken
    }, function(err, data) {
      if (err){
        req.logout();
        res.redirect('/');
      } else {
        next();
      }
    });
  } else {
    res.redirect('/');
  }
}

function validateAPI(req, res, next) {
  if (req.isAuthenticated()) {
    cognitoIdentityProvider.getUser({
      AccessToken: req.user.accessToken
    }, function(err, data) {
      if (err){
        res.status(401).send({ message: "Please ensure you are logged in before trying to do that!" });
      } else {
        next();
      }
    });
  } else {
    res.status(401).send({ message: "Please ensure you are logged in before trying to do that!" });
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
    return;
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
    
    return;
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

//Endpoint to get a fraternity from the DynamoDB
app.post('/in/fraternities/:namekey', validateAPI, function (req, res) {
  console.log("HERE");
  if (req.params.namekey != req.body.namekey) {
    res.status(500).send("MISMATCHED namekeys! namekey " + req.params.namekey + " != namekey " + req.body.namekey);
    return;
  }
  // TODO: VALIDATE!!! Ensure they have the permissions.
  let params = {
    TableName: 'FraternityInfo',
    Key: {
      "namekey": req.params.namekey,
    },
    UpdateExpression: "set #name = :n, #description = :d, #address = :a, #contact = :c",
    ExpressionAttributeNames: {
      "#name": "name",
      "#description": "description",
      "#address": "address",
      "#contact": "contact"
    },
    ExpressionAttributeValues: {
      ":n": req.body.name,
      ":d": req.body.description,
      ":a": req.body.address,
      ":c": req.body.contact
    }
  };

  documentClient.update(params, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200);
    }
    
    return;
  });
});

//Endpoint to get a fraternity from the DynamoDB
app.delete('/in/fraternities/:namekey', validateAPI, function (req, res) {
  
  // TODO: VALIDATE!!! Ensure they have the permissions.
  let params = {
    TableName: 'FraternityInfo',
    Key: {
      "namekey": req.params.namekey,
    }
  };

  console.log("Attempting a delete...");
  documentClient.delete(params, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200);
    }
    
    return;
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
    
    return;
  });
});

//Endpoint to get a fraternity from the DynamoDB
app.post('/in/events/:fraternityID/:eventID', validateAPI, function (req, res) {
  if (req.params.eventID != req.body.EventID ||
    req.params.fraternityID != req.body.FraternityID) {
    res.status(500).send("MISMATCHED PARAM AND BODY!");
    return;
  }

  // TODO: VALIDATE!!! Ensure they have the permissions.
  var params = {
    TableName: 'EventInfo',
    Key: {
      "EventID": req.params.eventID,
      // CHANGE THIS TO THE FRAT FROM THE PERSONS PERMISSIONS!!!
      "FraternityID": req.params.fraternityID
    },
    UpdateExpression: "set #event_name = :en, #description = :d, #location = :l, #starts = :s, #ends = :e",
    ExpressionAttributeNames: {
      "#event_name": "event_name",
      "#description": "description",
      "#location": "location",
      "#starts": "starts",
      "#ends": "ends"
    },
    ExpressionAttributeValues: {
      ":en": req.body.event_name,
      ":d": req.body.description,
      ":l": req.body.location,
      ":s": req.body.starts,
      ":e": req.body.ends
    }
  };

  documentClient.update(params, function (err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200);
    }
    
    return;
  });
});

//Endpoint to get a fraternity from the DynamoDB
app.delete('/in/events/:fraternityID/:eventID', validateAPI, function (req, res) {
  
  // TODO: VALIDATE!!! Ensure they have the permissions.
  let params = {
    TableName: 'EventInfo',
    Key: {
      "EventID": req.params.eventID,
      // CHANGE THIS TO THE FRAT FROM THE PERSONS PERMISSIONS!!!
      "FraternityID": req.params.fraternityID
    }
  };

  console.log("Attempting a delete...");
  documentClient.delete(params, function (err, data) {
    if (err) {
      console.log(err);
      res.status(500).send(err);
    } else {
      res.status(200);
    }
    
    return;
  });
});

/*
    Cognito User Management
*/

// Sign up a user
app.post('/in/users/signup/:scope/:role/:email', validateAPI,
  function (req, res, next) {
    // TODO: Allow signup
    console.log("SIGNUP Scope: " + req.params.scope + " Role: " + req.params.role + " Email: " + req.params.email);
    let params = {
      UserPoolId: CONSTANTS.poolID, /* required */
      Username: req.params.email, /* required */
      DesiredDeliveryMediums: ["EMAIL"],
      UserAttributes: [
        { Name: 'email', Value: req.params.email },
        { Name: 'custom:scope', Value: req.params.scope },
        { Name: 'custom:role', Value: req.params.role }
        // { Name: 'custom:group', Value: req.params.group || 'ZZZ' }
      ]
    };
    cognitoIdentityProvider.adminCreateUser(params, function (err, user) {
      console.log("Create user");
      if (err) { // an error occurred
        console.log(err);
        res.status(500).json(err);
        return;
      }
      console.log(user);
      let params = {
        GroupName: req.params.scope, /* required */
        UserPoolId: CONSTANTS.poolID, /* required */
        Username: user.User.Username /* required */
      };
      cognitoIdentityProvider.adminAddUserToGroup(params, function (err, info) {
        console.log("Add user to group #1");
        if (err) { // an error occurred
          console.log(err);
          res.status(500).json(err);
          return;
        }
        // console.log(data);
        let params = {
          GroupName: req.params.role, /* required */
          UserPoolId: CONSTANTS.poolID, /* required */
          Username: user.User.Username
        };
        cognitoIdentityProvider.adminAddUserToGroup(params, function (err, info) {
          console.log("Add user to group #2");
          if (err) {
            console.log(err);
            res.status(500).json(err) // an error occurred
          } else {
            // console.log(data);
            res.status(200).json(user);           // successful response
          }
        });
      });
    });
  });
// Delete user
app.post('/in/users/removefromgroup/:group/:email/', validateAPI,
  function (req, res) {
    cognitoIdentityProvider.listUsers({
      UserPoolId: CONSTANTS.poolID, /* required */
      Filter: 'email = \"' + req.params.email + "\"",
      Limit: 1,
    }, function (err, data) {
      if (err) {
        console.log(err);
        res.status(500).send(err);
        return;
      } else if (!data || data.length == 0) {
        res.status(500).send("Could not find user " + req.params.email);
        return;
      }
      // console.log("Listing " + data.length + " users");
      // console.log(data);
      for (let i = 0; i < data.Users.length; i++) {
        let params = {
          GroupName: req.params.group, /* required */
          UserPoolId: CONSTANTS.poolID, /* required */
          Username: data.Users[i].Username /* required */
        };
        cognitoIdentityProvider.adminRemoveUserFromGroup(params, function (err, info) {
          if (err) console.log(err, err.stack); // an error occurred
          else {
            console.log("Removed user from " + req.params.group);
            // console.log(data);           // successful response
            let params = {
              "Username": data.Users[0].Username,
              "UserPoolId": CONSTANTS.poolID
            }
            cognitoIdentityProvider.adminUserGlobalSignOut(params, function (err, logoutInfo) {
              if (err) console.log(err, err.stack); // an error occurred
              res.status(200).send(info);
            });
          }
        });
      }
    })
  });
// cognitoIdentityProvider.adminDeleteUser(params, function (err, data) {
//   if (err) {
//     console.log(err);
//     res.status(500).send(err);
//   } else {
//     console.log(data);
//     res.status(200).send(data);           // successful response
//   }
// });


// // Remove user permission
// app.post('/in/users/:email/removepermssions', validateAPI,
//   function (req, res) {
//     // TODO: Allow remove user permission
//   });


// // Add user permission
// app.post('/in/users/:email/addpermission/:permission', validateAPI,
//   function (req, res) {
//     // TODO: Allow add user permission
//   });
// app.post('/in/users/:email/setrole/:group/:scope', validateAPI,
//   function (req, res) {
//     cognitoIdentityProvider.adminUpdateUserAttributes({
//       UserPoolId: CONSTANTS.poolID,
//       Username: req.params.username,
//       UserAttributes: [
//         {
//           Name: 'custom:group',
//           Value: req.params.group
//         }
//       ]
//     }, function (err, data) {
//       if (err) console.log(err, err.stack); // an error occurred
//       else console.log(data);           // successful response
//     });
//     // TODO: Allow add user permission
//   });
// app.post('/in/users/:username/setrole/:role', validateAPI,
//   function (req, res) {
//     cognitoIdentityProvider.adminUpdateUserAttributes({
//       UserPoolId: CONSTANTS.poolID,
//       Username: req.params.username,
//       UserAttributes: [
//         {
//           Name: 'custom:role',
//           Value: req.params.role
//         }
//       ]
//     }, function (err, data) {
//       if (err) console.log(err, err.stack); // an error occurred
//       else console.log(data);           // successful response
//     });
//   });
app.post('/in/users/setgroup/:group/:email', validateAPI,
  function (req, res) {
    cognitoIdentityProvider.listUsers({
      UserPoolId: CONSTANTS.poolID, /* required */
      Filter: 'email = \"' + req.params.email + "\"",
      Limit: 1,
    }, function (err, data) {
      if (err || !data) {
        console.log(err);
        res.status(500).send(err);
        return;
      }
      else if (data.Users.length == 0) {
        let params = {
          UserPoolId: CONSTANTS.poolID, /* required */
          Username: req.params.email, /* required */
          DesiredDeliveryMediums: ["EMAIL"],
          UserAttributes: [
            { Name: 'email', Value: req.params.email },
            // { Name: 'custom:scope', Value: req.params.scope },
            // { Name: 'custom:role', Value: req.params.role }
            // { Name: 'custom:group', Value: req.params.group || 'ZZZ' }
          ]
        };
        cognitoIdentityProvider.adminCreateUser(params, function (err, user) {
          console.log("Create user");
          if (err || !user) { // an error occurred
            console.log(err);
            res.status(500).json(err);
            return;
          }
          // console.log(user);
          let params = {
            GroupName: req.params.group, /* required */
            UserPoolId: CONSTANTS.poolID, /* required */
            Username: user.User.Username /* required */
          };
          cognitoIdentityProvider.adminAddUserToGroup(params, function (err, data) {
            console.log("Add user to group");
            if (err) { // an error occurred
              console.log(JSON.stringify(err));
              res.status(500).json(err);
              return;
            }
          });
        });
        return;
      } else {
        let params = {
          GroupName: req.params.group, /* required */
          UserPoolId: CONSTANTS.poolID, /* required */
          Username: data.Users[0].Username /* required */
        };
        cognitoIdentityProvider.adminAddUserToGroup(params, function (err, _) {
          console.log("Add user to group #1");
          if (err) { // an error occurred
            console.log(JSON.stringify(err));
            res.status(500).json(err);
            return;
          } else {
            let params = {
              "Username": data.Users[0].Username,
              "UserPoolId": CONSTANTS.poolID
            }
            cognitoIdentityProvider.adminUserGlobalSignOut(params, function (err, logoutInfo) {
              console.log(err);
              console.log(logoutInfo);
            });
            res.status(200);
          }
        });
      }
    });
  });

// function isUserInGroup(req, group, done) {
//   cognitoIdentityProvider.getUser({
//     AccessToken: req.user.accessToken
//   }, function(err, data) {
//     if (err) return done(null,null); // an error occurred
//     else     return done(null, {group: req.user.group});
//   });
// }

// function getCurrentUser(req, done) {
//   let usr = {};
//   cognitoIdentityProvider.getUser({
//     AccessToken: req.user.accessToken
//   }, function (tErr, userData) {
//     if (tErr) {
//       console.log(tErr);
//     }
//     // return userData;
//     done(null, {user: userData});
//   });
// }
// function adminGetUser(data,) {
//   cognitoIdentityProvider.adminGetUser({
//     UserPoolId: CONSTANTS.poolID,
//     Username: data.user.Username
//   }, function (err, data) {
//     if (err) {
//       console.log(err);
//       res.status(500).send(err);
//     }
//     let user = {};
//     let attrs = data.UserAttributes;
//     for (let i = 0; i < attrs.length; i++)
//       user[attrs[i].Name] = attrs[i].Value;
//     console.log(user);
//     if (err) res.status(500).send(err); // an error occurred
//     else res.status(200).json(user); // successful response
//   });
// }


app.get('/in/users/current', validateAPI,
  function (req, res) {
    cognitoIdentityProvider.getUser({
      AccessToken: req.user.accessToken
    }, function (tErr, userData) {
      if (tErr) {
        console.log(tErr);
        req.logout();
        res.redirect("/");
        return;
      }
      cognitoIdentityProvider.adminGetUser({
        UserPoolId: CONSTANTS.poolID,
        Username: userData.Username
      }, function (err, data) {
        if (err) {
          console.log(err);
          req.logout();
          res.redirect("/");
          return;
        }
        
        let user = {};
        user.groups = req.user.groups;
        user.display_group = req.user.groups[0];
        let attrs = data.UserAttributes;
        for (let i = 0; i < attrs.length; i++)
          user[attrs[i].Name] = attrs[i].Value;
        res.status(200).json(user); // successful response
      });
    })
  });
app.get('/in/users/current/groups', validateAPI,
  function (req, res) {
    console.log("Getting current user's groups");
    console.log(req.user);
    res.status(200).json(req.user.groups);
  });
  
app.get('/in/users/current/group/', validateAPI,
  function (req, res) {
    cognitoIdentityProvider.listUsersInGroup({
      GroupName: req.user.groups[0], /* required */
      UserPoolId: CONSTANTS.poolID /* required */
    }, function (err, data) {
      if (err) {
        res.status(500).send(err); // an error occurred
        return;
      } else if (!data.Users) {
        res.status(500).send("Users is null! \n" + data); // an error occurred
        return;
      } else if (!data.Users) {
        res.status(500).send("No user in group " + req.user.groups[0]);
        return;
      }
      let users = [];
      for (let i = 0; i < data.Users.length; i++) {
        let u = {};
        let attrs = data.Users[i].Attributes;
        for (let j = 0; j < attrs.length; j++)
            u[attrs[j].Name] = attrs[j].Value;
        console.log(u);
        users.push(u);
      }
      /*
      console.log("Trying to send back current group (" + req.user.groups[0] + ") of " + data.Users.length + " successfully");
      console.log(data.Users);
      */
      res.status(200).json(users);  // successful response
    });
  });




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

console.log("Server started on port " + httpPort);
