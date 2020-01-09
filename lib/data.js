// Dependencies

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');


// Container for the module

var lib = {};

//Base directory for the data folder

lib.baseDir = path.join(__dirname,'../.data/');

//Write data to the file
lib.create = (dir,file,data,callback) => {
    // Open file for the writing

    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',(err,fileDescriptor) => {
        if(!err && fileDescriptor)
        {
            //Convert JSON data to the string format

            var stringData = JSON.stringify(data);

            // Write data to the file in the string format

            fs.write(fileDescriptor,stringData,(err) =>{
                if(!err)
                {
                    fs.close(fileDescriptor,(err) =>{
                        if(!err)
                        {
                            callback(false);
                        }
                        else
                        {
                            callback('Error Closing new file');
                        }
                    });
                }
                else
                {
                    callback('Error Writing new file');
                }
            });
        }
        else
        {
            callback('Could Not create new file, it may already exist');
        }

    });
};

lib.read = (dir,file,callback) => {
    //read the file

    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',(err,data) => {
        
        if(!err && data)
        {
            parseData = helpers.parseJsonToObject(data);
            callback(false,parseData);
        }
        else
        {
            callback(err,data);
        }
    });
};

lib.update = (dir,file,data,callback) => {

    //Open the file

    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',(err,fileDescriptor) => {

        if(!err && fileDescriptor)
        {
            var stringData = JSON.stringify(data);

            // here we are updating the file so TRUNCATE will be done
            fs.ftruncate(fileDescriptor,(err) => {
                if(!err)
                {
                    fs.writeFile(fileDescriptor,stringData,(err) => {
                        if(!err)
                        {
                            fs.close(fileDescriptor,(err) => {
                                if(!err)
                                {
                                    callback(false);
                                }
                                else
                                {
                                    callback('Error to close the file',err);
                                }
                            });
                        }
                        else
                        {
                            callback('Error to write the file',err);
                        }
                    });
                }
                else
                {
                    callback('error to truncate the file',err);
                }
            });
        }
        else
        {
            callback('error to open the file, it may not exist',err);
        }
    });
};

lib.delete = (dir,file,callback) => {

    // Unlink the file
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err) => {
        if(!err)
        {
            callback(false);
        }
        else
        {
            callback('error deleting the file');
        }
    });
};

//List all the items in a directory
lib.list = (dir, callback) => {
    fs.readdir(lib.baseDir+dir+'/',(err,data) => {
        if(!err)
        {
            if(data)
            {
                if(data.length > 0)
                {
                    var trimmedFileName = [];
                    data.forEach((fileName) => {
                        trimmedFileName.push(fileName.replace('.json',''));
                    });
                    callback(false,trimmedFileName);   
                }
                else
                {
                    callback(400,{'Error':'data length is zero or no data available'})
                }
            }
            else
            {
                callback(400,{'Error':'data is not available, and no error found'})
            }
        }
        else
        {
            callback(err,data); 
        }
    });
};


//Export the lib

module.exports = lib;