/**
 * Primary file for the API
 * 
*/

// Libryres
var http = require('http');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');

// The server should respond to all requests with a string
var server = http.createServer(function(req, res){
  
  // Get the URL and parse it
  var parsedUrl = new URL(req.url, "http:localhost:3000/");
  console.log(parsedUrl)

  // Get the path
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the query string as an object
  var queryStringObject = parsedUrl.searchParams

  // Get the HTTP method
  var method = req.method.toUpperCase();

  // Get the headers
  var headers = req.headers;

  // Get the payload, if there's any.
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function(data) {
    buffer += decoder.write(data);
  });
  req.on('end', function() {
    buffer += decoder.end();
  
    // Choose the handler this request should go to. If one is not found, use the notFound handler
    var chosenHandler = typeof(router[trimmedPath]) != 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Constroct the data object to send to the handler
    var data = {
      trimmedPath,
      queryStringObject,
      method,
      headers,
      'payload' : buffer
    }

    // Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {

      // Uset the statuc ode calleds back by the handler, or default to an empty object
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

      // Yse the payload called back by the handler, or default to an empty object
      payload = typeof(payload) == 'object' ? payload : {};

      var payloadString = JSON.stringify(payload);

      // Return the response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      //res.setHeader("Content-type", "Application/json");
      res.end(payloadString)

      // Log the request
      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
});

// start the server, and have it listen on port 3000
server.listen(config.httpPort, function() {
  console.log(`Server listening on http://localhost:${config.httpPort} in ${config.envName} mode.`);
});

// Define the handlers
var handlers = {};

// Sample handler
handlers.sample = function(data, callback) {
  // Callback a http status code, and a payload
  callback(406, {'ping': 'pong'})
}

// NotFound handler
handlers.notFound = function(data, callback) {
  callback(404);
}

// Define a request router
var router = {
  'sample': handlers.sample
};