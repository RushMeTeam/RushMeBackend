// File: start.controller.js
// Description: Express server currently used to just serve the static Angular content

var express    = require('express'),
    app        = express(),
    fs         = require('fs'),
    http       = require('http'),
    morgan     = require('morgan'),
    path       = require('path'),
    bodyParser = require('body-parser');

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
var httpPort = 80;
var httpServer = http.createServer(app);
httpServer.listen(httpPort);

console.log('Server running on port %s', httpPort);
