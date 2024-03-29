/**
 * Helpers for various tasks
 * 
*/

// Dependencies
var crypto = require('crypto');
var config = require('../config')


// Contianer for all the helpers
var helpers = {}

// Create a SHA256 hash
helpers.hash = function(str) {
    if (typeof(str) == 'string' && str.length > 0) {

        var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash;

    } else {

        return false;

    }
}

// Parse JSON string to an object in all cases, without throwing
helpers.parseJSONToObject = function(str) {

    if (typeof(str) == 'string') {
        try {
            var obj = JSON.parse(str);
            return obj;
        } catch {
            return {};
        }
    }

}
module.exports = helpers;