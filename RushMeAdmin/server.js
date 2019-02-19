// File: start.controller.js
// Description: Express server currently used to just serve the static Angular content

var express    = require('express'),
    app        = express(),
    fs         = require('fs'),
    https       = require('https'),
    morgan     = require('morgan'),
    path       = require('path'),
    bodyParser = require('body-parser'),
    authenticatedRoute = express.Router(),
    CognitoExpress = require("cognito-express");
    // UserPoolId : "us-east-1_hp56TBp7o",
    // ClientId : "4o9r7dvj3kiislsbh4cbhkf42"
const authURL = "https://auth.rushme.app/login?response_type=code&client_id=4o9r7dvj3kiislsbh4cbhkf42&redirect_uri=https://127.0.0.1/in/dashboard";

app.use("/in", authenticatedRoute);

const cognitoExpress = new CognitoExpress({
    region: "us-east-1",
    cognitoUserPoolId: "us-east-1_hp56TBp7o",
    tokenUse: "access" //Possible Values: access | id
    // tokenExpiration: 3600000 //Up to default expiration of 1 hour (3600000 ms)
});

authenticatedRoute.use(function(req, res, next) {

    //I'm passing in the access token in header under key accessToken
    let accessTokenFromClient = req.headers.accesstoken;

    //Fail if token not present in header.
    if (!accessTokenFromClient) return res.send("Sorry no token");

    cognitoExpress.validate(accessTokenFromClient, function(err, response) {

        //If API is not authenticated, Return 401 with error message.
        if (err)
            return res.send("Authentication failed");

        //Else API has been authenticated. Proceed.
        res.locals.user = response;
        next();
    });
});

authenticatedRoute.get("/dashboard", function(req, res, next) {
    res.send(`Hi ${res.locals.user.username}, your API call is authenticated!`);
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
