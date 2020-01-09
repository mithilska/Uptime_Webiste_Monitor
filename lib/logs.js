/*
*
*library for storing and routing the logs
*
*/

//Dependeces
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');


//Cointainer for the module

var lib = {};

//base directory for logs folder

lib.baseDir = path.join(__dirname,'../.logs/workers/')

//Append the string to the file or create the file before appending to it

lib.append = (file,str,callback) => {
    //Opening the file for appending
    fs.open(lib.baseDir+file+'.log','a',(err,fileDescriptor) => {
        if(!err)
        {
            if(fileDescriptor)
            {
                fs.appendFile(fileDescriptor,'\n\n'+str+'\n\n',(err) => {
                    if(!err)
                    {
                        fs.close(fileDescriptor,(err) => {
                            if(!err)
                            {
                                callback(false);
                            }
                            else
                            {
                                callback('Error closing file that was being appended');
                            }
                        });
                    }
                    else
                    {
                        callback('Error appending to file');
                    }
                });
            }
            else
            {
                callback('no data in file descriptor');
            }
        }
        else
        {
            callback('Unable to open the file');
        }
            
    });
};

//list all the logs and optionally include the compress logs

lib.list = (includeCompressedlogs,callback) => {
    fs.readdir(lib.baseDir,(err,data) =>
    {
        if(!err)
        {
            if(data && data.length > 0)
            {
                var trimmedFileNames = [];
                data.forEach(fileName => {
                    //Add the .log file

                    if(fileName.indexOf('.log') > -1)
                    {
                        trimmedFileNames.push(fileName.replace('.log',''));
                    }
                    else
                    {
                        callback('trimmed fail');
                    } 
                    //Add on the .gz file
                    if(fileName.indexOf('.gz.b64') > -1 && includeCompressedlogs)
                    {
                        trimmedFileNames.push(fileName.replace('.gz.b64'),'');
                    }
                });
                callback(false,trimmedFileNames);
            }
            else
            {
                callback('\n Unable to read the data' +err + data);
            }
        }
        else
        {
            callback('\n Unable to read the directory and its data :\n'+err);
        }
    });
};

//Compress the content of one .log file into a .gz.b64 file within the same directory
lib.compress = (logId,newFileId,callback) => {
    var sourceFile = logId+'.log';
    var destFile = newFileId+'.gz.b64';

    //Read the source file
    fs.readFile(lib.baseDir+sourceFile,'utf8',(err,inputString) => {
        if(!err)
        {
            if(inputString)
            {
                //Compress the data using gzib
                zlib.gzip(inputString,(err,buffer) => {
                    if(!err)
                    {
                        if(buffer)
                        {
                             //Send the new compress the data to the destination file
                             fs.open(lib.baseDir+destFile,'wx',(err,fileDescriptor) => {
                                 if(!err)
                                 {
                                    if(fileDescriptor)
                                    {
                                        //Write to the destination file
                                        fs.writeFile(fileDescriptor,buffer.toString('base64'),(err) => {
                                            if(!err)
                                            {
                                                //Close the destination file
                                                fs.close(fileDescriptor,(err) => {
                                                    if(!err)
                                                    {
                                                        callback('successfully closed the file after compression');
                                                    }
                                                    else
                                                    {
                                                        callback('Error to closeing the file'+err);
                                                    }
                                                });
                                            }
                                            else
                                            {
                                                callback('Error to write the file');
                                            }
                                        });
                                    }
                                    else
                                    {
                                        callback('file descriptor err');
                                    }
                                 }
                                 else
                                 {
                                     callback('There is an error while opening the dir to the destination'+err);
                                 }
                             });
                        }
                        else
                        {
                            callback('buffering failed while compressing the data');
                        }
                    }
                    else
                    {
                        callback('There is an error which compressing the data using Gzip');
                    }
                });
            }
            else
            {
                callback('Error in Input String',+err);
            }
        }
        else
        {
            callback('There is an error in read file for compressing');
        }
    });
};


//Decompress the contents of the .gz.bs64 file into the string variable

lib.decompress = (fileId,callback) =>{
    var filName = fileId+'.gz.b64';
    fs.readFile(lib.baseDir+fileName,'utf8',(err,str) => {
        if(!err)
        {
            if(str)
            {
                //Decompress the data
                var inputBuffer = Buffer.from(str,'base64');
                zlib.unzib(inputBuffer,(err,outputBuffer) => {
                    if(!err)
                    {
                        if(outputBuffer)
                        {
                            //Callback
                            var str = outputBuffer.toString();
                            callback(false,str);
                        }
                        else
                        {
                            callback('There is not output Buffer fetch from the zip file');
                        }
                    }
                    else
                    {
                        callback('There is an error found while unzip it' + err);
                    }
                });
            }
            else
            {
                callback('there is no string found in log dir to decompress it');
            }
        }
        else
        {
            callback('there is an error while reading the compress file in base Dir');
        }
    });
};

////Truncate the logs

lib.truncate = (logId,callback) => {
    fs.truncate(lib.baseDir+logId+'.log',0,(err) =>{
        if(!err)
        {
            callback(false);
        }
        else
        {
            callback('there is an error while truncating the file'+err);
        }
    });
};

//Export it

module.exports = lib;