/**
 * Primary file for the API
 *
 */

// Libryres
var http = require("http");
var https = require("https");
var StringDecoder = require("string_decoder").StringDecoder;
var config = require("./config");
var fs = require("fs");

var _data = require('./lib/data')

// TESTING
// @TODO delete this
_data.update('test', 'newFile', {'orange':'blue'}, (err) => {
  console.log(`This was the error: ${err}`);
})

// Instantiate the HTTP server
var httpServer = http.createServer(function (req, res) {
  unifiedServer(req, res);
});

// start the http server
httpServer.listen(config.httpPort, function () {
  console.log(
    `Server listening on http://localhost:${config.httpPort} in ${config.envName} mode.`
  );
});

// Instantiate the HTTPS server
var options = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/cert.pem"),
};
var httpsServer = https.createServer(options, function (req, res) {
  unifiedServer(req, res);
});

// start the https server
httpsServer.listen(config.httpsPort, function () {
  console.log(
    `Server listening on https://localhost:${config.httpsPort} in ${config.envName} mode.`
  );
});

// All the logic for both the HTTP and HTTPS server
var unifiedServer = function (req, res) {
  // Get the URL and parse it
  var parsedUrl = new URL(req.url, "http:localhost:3000/");
  console.log(parsedUrl);

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get the query string as an object
  var queryStringObject = parsedUrl.searchParams;

  // Get the HTTP method
  var method = req.method.toUpperCase();

  // Get the headers
  var headers = req.headers;

  // Get the payload, if there's any.
  var decoder = new StringDecoder("utf-8");
  var buffer = "";
  
  req.on("data", function (data) {
    buffer += decoder.write(data);
  });

  req.on("end", function () {
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found, use the notFound handler
    var chosenHandler =
      typeof router[trimmedPath] != "undefined"
        ? router[trimmedPath]
        : handlers.notFound;

    // Constroct the data object to send to the handler
    var data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      payload: buffer,
    };

    // Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Uset the statuc ode calleds back by the handler, or default to an empty object
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // Yse the payload called back by the handler, or default to an empty object
      payload = typeof payload == "object" ? payload : {};

      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader("Content-Type", "application/json");
      res.writeHead(statusCode);
      res.end(payloadString);

      // Log the request
      console.log("Returning this response: ", statusCode, payloadString);
    });
  });
};

// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function (data, callback) {
  // Callback a http status code, and a payload
  callback(406, { ping: "pong" });
};

// NotFound handler
handlers.notFound = function (data, callback) {
  callback(404);
};

// Ping Handler
handlers.ping = function (data, callback) {
  callback(200, { status: "running" });
};

// Define a request router
var router = {
  ping: handlers.ping,
};
