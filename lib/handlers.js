/**
 * Request handlers
 *
 */

// Dependencies
var _data = require("./data");
var helpers = require("./helpers");

// Define the handlers
var handlers = {};

// Users
handlers.users = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];

  const method = data.method.toLowerCase();

  if (acceptableMethods.indexOf(method) > -1) {
    handlers._users[method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users submethods
handlers._users = {};

// Users - post
// Required data: firstName, lastName,. phone, password, tosAgreement
handlers._users.post = function (data, callback) {
  console.log("this was the data", data);

  // Check that all required filed are filled out
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length > 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement == true
      ? true
      : false;

  if ((firstName, lastName, phone, password, tosAgreement)) {
    // Make sure that the user doesnt alredy exist
    _data.read("users", phone, function (err) {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);
        if (!hashedPassword)
          return callback(500, { Error: "Could not hash the user's password" });

        // Create the user object
        var userObject = {
          firstName,
          lastName,
          phone,
          hashedPassword,
          tosAgreement: true,
        };

        console.log("phone", phone);

        // store the user
        _data.create("users", phone, userObject, function (err) {
          if (err) {
            callback(200);
          } else {
            console.error(err);
            callback(500, { Error: "Could not create the new user" });
          }
        });
      } else {
        // User already exist
        callback(400, {
          Error: "A user with that phone number already exists",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required filed" });
  }
};

// Users - get
// Required data: phone
// Opitional data: none
// @TODO Only let an authenticated user access their object. Don't let them access anyone else's
handlers._users.get = function (data, callback) {
  // Check that the phone number provided is valid.

  var phone =
    typeof data.queryStringObject.get("phone") == "string" &&
    data.queryStringObject.get("phone").trim().length >= 10
      ? data.queryStringObject.get("phone").trim()
      : false;

  if (phone) {
    // Lookup the user
    _data.read("users", phone, function (err, user) {
      if (!err && user) {
        // Removed the hashed Password from the user object before returning it to the requester
        delete user.hashedPassword;
        callback(200, user);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required filed." });
  }
};

// Users - put
// Required data: phone
// Optional: firstName, lastName, password (at least one must be specified)
// @TODO Only let an authenticated user update their own object. Don't let anyone else's
handlers._users.put = function (data, callback) {
  var phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length >= 10
      ? data.payload.phone.trim()
      : false;

  // check for the opitional fields.
  var firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  var password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  
      // Error if the phone is invlaid
      if(phone) {

        if (firstName || lastName || password) {

          _data.read('users', phone, function(err, userData) {

            if (!err && userData) {
              // Update the fieldes necessaty
              if (firstName) {
                userData.firstName = firstName
              }

              if (lastName) {
                userData.lastName = lastName
              }

              if (password) {
                userData.hashedPassword = helpers.hash(password)
              }

              // Store the new updates
              _data.update('users', phone, userData, function(err) {
                console.log('This was the error', err)
                if (!err) {
                
                  callback(200)
                
                } else {
                
                  console.log(err)
                
                  callback(500, {'Error': 'Could not update the user'})
                
                }

              })

            } else {

              callback(400, {'Error':'The specified user does not exists'})

            }
              
          })

        } else {
          callback(400, {'Error': 'Missing fields to update'})
        }

      } else {
        callback(400, { 'Error':'Missing required fields'})
      }

};

// Users - delete
// Required Filed: Phone
// @TODO Only let an authenticated user delete their won object. Don't let anyone else's
// @TODO Cleanup (Delete) any other data files associated with this user
handlers._users.delete = function (data, callback) {

  // check that the phone number is valid.
  var phone =
    typeof data.queryStringObject.get("phone") == "string" &&
    data.queryStringObject.get("phone").trim().length >= 10
      ? data.queryStringObject.get("phone").trim()
      : false;

  if (phone) {
    // Lookup the user
    _data.read("users", phone, function (err, user) {
      if (!err && user) {
        // delete the user
        _data.delete('users', phone, function(err) {
          if (!err) {
            callback(200)
          } else {
            callback(500, {'Error': 'Could not delete the specified user'})
          }
        })
        
      } else {
        callback(404, {'Error': 'Could not find the specified user'});
      }
    });
  } else {
    callback(400, { Error: "Missing required filed." });
  }

};



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