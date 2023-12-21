/**
 * Request handlers
 * 
*/

// Dependencies

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

// Export the module

module.exports = handlers;