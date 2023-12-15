/**
 * Library for storing and editing data
 * 
*/

// Dependencies
const fs = require('fs')
const path = require('path')

// Container for the module (to be exported)
const lib = {}

// define the base directory of the data folder
lib.baseDir = path.join(__dirname,'/../.data/')
console.log(lib.baseDir)

// Write data to a file
lib.create = function(dir, file, data, callback) {
    

    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx',function(err, fileDescriptor) {
            
        if(!err && fileDescriptor) {

            // Convert data to string
            var stringData = JSON.stringify(data);

            // write to fiel and close it.
            fs.writeFile(fileDescriptor, stringData, function(err) {

                if (!err) {

                    fs.close(fileDescriptor, function(err) {

                        if (!err) {

                            callback('false')

                        } else {

                            callback('Error closing new file')

                        }

                    })

                } else {

                    callback('Error writing to new file')

                }

            })

        } else {
            
            callback('Colud not create new file, it may already exist');
        
        }

    })

}




// Export the module
module.exports = lib;
