/*
*
*helpers for the various task
*
*/

//dependences

const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
var fs = require('fs');

//container for the vairous helpers
var helpers = {};

// Create a SHA256 hash

helpers.hash = (str) => {
    if(typeof(str) == 'string' && str.length > 0)
    {
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
        return hash;
    }
    else
    {
        return false;
    }
};

//parse a JSON string to a json object in all cases without throwing

helpers.parseJsonToObject = (str) => {
    try
    {
        var obj = JSON.parse(str);
        return obj;
    }
    catch(e)
    {
        return{};
    }
};

helpers.createRandomString = (strLength) => {
    // console.log('strLength',strLength)
    // console.log('typeof string',typeof(strLength));
    
    strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
    
    if(strLength)
    {
        //Define all the posible character that could go to string
        var possibleCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    
        //Starting the final string
        var str ='';
        for(i=1;i<=strLength;i++)
        {
            //get the random string from the possiblecharacter string
            var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length));

            //append this character to the final string
            str += randomCharacter;

            //Return the fimal string
        }
        return str;
    }
    else
    {
        // break;
        return false;
    }
};


// Sent an sms via twilio

helpers.sendTeilioSms = (phone,message,callback) => {
    //Validate Paramater

    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
    message = typeof(message) == 'string' && message.trim().length > 0 && message.trim().length <= 1600 ? message.trim() : false;

    if(phone)
    {
        if(phone.trim() > 7000000000 || phone.trim() > 8000000000 || phone.trim() > 9000000000)
        {
            if(message)
            {
                //Configure the request payload
                var payload = 
                {
                    'From' : config.twilio.fromPhone,
                    'To' : '+91'+phone,
                    'Body' : message,
                };
                // console.log(payload);

                //Stringify the payload
                var stringPayload = querystring.stringify(payload);


                //Configure the request details
                var requestDetails = {
                    'protocol' : 'https:',
                    'hostname' : 'api.twilio.com',
                    'method' : 'POST',
                    'path' : '/2010-04-01/Accounts/'+config.twilio.accountSid+'/Messages.json',
                    'auth' : config.twilio.accountSid+':'+config.twilio.authToken,
                    'headers' : {
                        'Content-Type':'application/x-www-form-urlencoded',
                        'content-Length':Buffer.byteLength(stringPayload)
                    }
                };
            
                //Iniciate the request object

            var req = https.request(requestDetails,(res) =>{
                //Grab the status of the sent requests

                var status = res.statusCode;

                //callback successfully if the request went through

                if(status == 200 || status == 201)
                {
                    callback(false);
                }
                else
                {
                    callback('status code returned was' + status );
                }
            });

                //bind to the error event so it doesn't get thrown

                req.on('error',(e) =>{
                    callback(e);
                });

                //add the payload
                req.write(stringPayload);

                //End the requst
                req.end();
            }
            else
            {
                callback(400,{'Error':'Message length exceed, only accept 1600 Characters'});
            }
        }
        else
        {
            callback(400,{'Error':'number start with 7,8 & 9 will be accepted'});
        }
    
    }
    else
    {
        callback(400,{'Error':'Phone number is invalid'});
    }
};

//GET the string content from the template

helpers.getTemplate = (templateName,data,callback) => { 

    templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
    data = typeof(data) == 'object' && data!= null ? data : {};
    // console.log('helpers get templatename\n'+JSON.stringify(data) +'\n\n')
    
    if(templateName)
    {
        var templateDir = path.join(__dirname,'/../templates/');
        fs.readFile(templateDir+templateName+'.html','utf8',(err,str) => {
            if(!err && str && str.length > 0)
            {
               //Do the interpolation on the string before returning it.
               var finalString = helpers.interpolate(str,data);
                // console.log('helpers temp 4',finalString);
                callback(false,finalString);
            }
            else
            {
                callback('No template could be found');
            }
        });
    }
    else
    {
        callback('A valid template name was not specified');
    }
};

//Add the universal header and footer to a string, and pass the data object to the header and footer for interpolation.

helpers.addUniversalTemplate = (str,data,callback) => {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data != null ? data : {};

    //Get the header from the _header html file.

    helpers.getTemplate('_header',data,(err,headerString) => {
        if(!err)
        {
            if(headerString)
            {
                // Once you get the string from the header file template
                // Get the footer template from the template directory
                helpers.getTemplate('_footer',data,(err,footerString) => {
                    if(!err)
                    {
                        if(footerString)
                        {
                            /*Once you get the header and footer string from the file then
                            combine it together and show it on browser */
                            
                            var fullString =  headerString + str + footerString;
                            callback(false,fullString);
                            
                        }
                        else
                        {
                            callback('There is an error to get the string from the footer file');
                        }
                    }
                    else
                    {
                        callback('There is an error to get the footer file from the string');
                    }
                });
            }
            else
            {
                callback('There is an error to parse the headerstring into the header template or may be it is empty');
            }
        }   
        else
        {
            callback('There is an error into the _header template');
        }
    });
};


//  take the given string and a data object and find/replace all the keys within in it.

helpers.interpolate = (str,data) => {
    str = typeof(str) == 'string' && str.length > 0 ? str : '';
    data = typeof(data) == 'object' && data != null ? data : {};

    


    //Add the template global to the data object, prepairing the key name with'global'
    

    for(var keyName in config.templateGlobals)
    {
       
        if(config.templateGlobals.hasOwnProperty(keyName))
        {    
            data['global.'+keyName] = config.templateGlobals[keyName];
            // console.log('config.templateGlobals \n\t',data['global.'+keyName] );
        }
    }

    // For Each key in the data obect we want to insert its value into the string and its corresponding place holder

    for (var key in data)
    {
        
        if(data.hasOwnProperty(key) && typeof(data[key]) == 'string')
        {
            var replace = data[key];
            var find = '{'+key+'}';
            str = str.replace(find,replace);
        }
    }
    return str;
};


//Get the content of a static  (public) asset

helpers.getStaticAsset = (fileName,callback) => {
    fileName = typeof(fileName) == 'string' && fileName.length > 0 ? fileName : false;
    if(fileName)
    {
        var publicDir = path.join(__dirname,'/../public/')
        fs.readFile(publicDir+fileName,(err,data) => {
            if(!err)
            {
                if(data)
                {
                    callback(false,data);
                }
                else
                {
                    callback(404,{'Error':'There is an error to get the data for get static asset'});
                }
            }
            else
            {
                callback(500,{'Error':'There is an error to read the filename from public dir for get static asset'})
            }
        });
    } 
    else
    {
        callback('A valid file name is needed');
    }
};



//export the module

module.exports = helpers;