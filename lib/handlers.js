/*
*
* Request Handlers
*
*/


//Dependences

const _data = require('./data');
const helpers = require('./helpers');
const config = require('./config');


//Define the handers
var handlers = {};

/*
*
*HTML Handlers
*
*/

//Index handlers 

handlers.index = (data,callback) => {
    // callback(undefined,undefined,'html');

    //Reject any request that isn't  a GET method

    if(data.method == 'get')
    {
        //prepare data for data interpolation
        var templateData = {
            'head.title' : 'Uptime Monitoring - Made Simple',
            'head.description' : 'Hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii,   we offer free, simple uptime monitoring for HTTP / HTTPS sites of all kinds, when site goes down, we will send you a text to let you know',
            'body.title1' : ' Up-Time Monitoring',
            'body.title2' : 'Made Simple',
            'body.class' : 'index'
        };


        //Read the index template as a string
        
        helpers.getTemplate('index',templateData,(err,str) => {
            if(!err)
            {
                if(str)
                {
                    // console.log('template 3',str)
                    // callback(200,str,'html');
                    //Add the universal header and footer 

                    helpers.addUniversalTemplate(str,templateData,(err,str) => {
                        if(!err)
                        {
                            if(str)
                            {
                                // Return the page as html
                                callback(200,str,'html');
                            }
                            else
                            {
                                callback(500,undefined,'html');
                            }
                        }
                        else
                        {
                            callback('There is an error to add the universal template in get template');
                        }
                    });
                }
                else
                {
                    callback(405,{'Error':'There is not string in it'})
                }
            }
            else
            {
                callback(500,{'Error':err});
            }
        });
    }
    else
    {
        callback(405,undefined,'html');
    }

};

//Create Account handlers

handlers.accountCreate = (data,callback) => {

    //Reject the request if the method is not get

    if(data.method == 'get')
    {
        //prepare data for interpolation
        var templateData = 
        {
            'head.title' : 'Create an Account',
            'head.description' : 'SingUp is easy and only take a few seconds',
            'body.class' : 'accountCreate'
        };

        //Read the template as a string
        helpers.getTemplate('accountCreate',templateData,(err,str) => {
            if(!err)
            {
                if(str)
                {
                    helpers.addUniversalTemplate(str,templateData,(err,str) =>{
                        if(!err)
                        {
                            callback(200,str,'html');
                        }
                        else
                        {
                            callback(405,undefined,'html');
                        }
                    });
                }
                else
                {
                    callback(405,undefined,'html');
                }
            }
            else
            {
                callback(405,undefined,'html');
            }
        });


    }
};

//Create New Session handlers

handlers.sessionCreate = (data,callback) => {

    //Reject the request if the method is not get

    if(data.method == 'get')
    {
        //prepare data for interpolation
        var templateData = 
        {
            'head.title' : 'Login To your account',
            'head.description' : 'Please enter the phone number and password to access the account',
            'body.class' : 'sessionCreate'
        };

        //Read the template as a string
        helpers.getTemplate('sessionCreate',templateData,(err,str) => {
            if(!err)
            {
                if(str)
                {
                    helpers.addUniversalTemplate(str,templateData,(err,str) =>{
                        if(!err)
                        {
                            callback(200,str,'html');
                        }
                        else
                        {
                            callback(405,undefined,'html');
                        }
                    });
                }
                else
                {
                    callback(405,undefined,'html');
                }
            }
            else
            {
                callback(405,undefined,'html');
            }
        });
    }
};

//Session deletion handlers

handlers.sessionDelete = (data,callback) => {

    //Reject the request if the method is not get

    if(data.method == 'get')
    {
        //prepare data for interpolation
        var templateData = 
        {
            'head.title' : 'Logged Out',
            'head.description' : 'Logged Out Successfully',
            'body.class' : 'sessionDeleted'
        };

        //Read the template as a string
        helpers.getTemplate('sessionDeleted',templateData,(err,str) => {
            if(!err)
            {
                if(str)
                {
                    helpers.addUniversalTemplate(str,templateData,(err,str) =>{
                        if(!err)
                        {
                            callback(200,str,'html');
                        }
                        else
                        {
                            callback(405,undefined,'html');
                        }
                    });
                }
                else
                {
                    callback(405,undefined,'html');
                }
            }
            else
            {
                callback(405,undefined,'html');
            }
        });
    }
};


//account Edit handlers

handlers.accountEdit = (data,callback) => {

    //Reject the request if the method is not get

    if(data.method == 'get')
    {
        //prepare data for interpolation
        var templateData = 
        {
            'head.title' : 'Account Setting Page',
            'body.class' : 'accountEdit'
        };

        //Read the template as a string
        helpers.getTemplate('accountEdit',templateData,(err,str) => {
            if(!err)
            {
                if(str)
                {
                    helpers.addUniversalTemplate(str,templateData,(err,str) =>{
                        if(!err)
                        {
                            callback(200,str,'html');
                        }
                        else
                        {
                            callback(405,undefined,'html');
                        }
                    });
                }
                else
                {
                    callback(405,undefined,'html');
                }
            }
            else
            {
                callback(405,undefined,'html');
            }
        });
    }
};



/*
* JSON API handlers
*
*/


// User Handlers

handlers.users = (data, callback) => {
    var acceptableMethods = ['post','put','get','delete'];
    // console.log("data method ",data.method)
    // console.log("indexof methd",acceptableMethods.indexOf(data.method));
    if (acceptableMethods.indexOf(data.method) > -1)
    {
        console.log("accept data",data);
        handlers._users[data.method](data,callback);
    }
    else
    {
        callback(405,{'Status Code' : 'Methods Not Allowed'});  
    }
};

//container for the users Sub-methods
handlers._users = {};

//User - post
//Required data : firstName, LastName, Phone, password, tosAggrement
//Optional Data : None
handlers._users.post = (data,callback) => {

    //Check that if all data is filled or not;
    
    // console.log('data',data);

    // console.log("first name",data.payload.firstName)
    // console.log("last name",data.payload.lastName)
    // console.log("phone",data.payload.phone)
    // console.log("password",data.payload.password)
    // console.log("tosAgreement",data.payload.tosAgreement)


    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length > 0 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    var tosAggrement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    // console.log("first name",firstName)
    // console.log("last name",lastName)
    // console.log("phone",phone)
    // console.log("password",password)
    // console.log("tosAgreement",tosAggrement)
    

    if(firstName && lastName && phone && password && tosAggrement)
    {
        //Make sure that user doesnot exist
        _data.read('users',phone,(err,data) => {
            if(err)
            {
                //Hash the password  
                var hashedPassword = helpers.hash(password);

                //create the user object

                if(hashedPassword)
                {
                    var userObject = {
                        'firstName' : firstName,
                        'lastName'  : lastName,
                        'phone' : phone,
                        'hashedPassword' : hashedPassword,
                        'tosAgreement' : true
                    };
    
                    //  store the user
    
                    _data.create('users',phone,userObject,(err) =>{
                        if(!err)
                        {
                            callback(200,{'Status':`${phone} is successfully created`});
                        }
                        else
                        {
                            console.log(err);
                            callback(500,{'Error':'User with that phone Number already exist'});
                        }
                    });
                }
                else
                {
                    callback(500,{'Error':'Could not hash the user\'s password'});
                }

                

            }
            else
            {
                // User already exist;
                callback (400,{'Error' :'User with that phone Number already exist'});
            }

        });

    }
    else
    {
        callback(400,{'Error' : 'Missing required fields'});
    }
};

//User - get

handlers._users.get = (data,callback) => {
    
    //Users-GET
    //Required data = Phone
    //Optional DATA - none
    //@TODO Only let the authentic user to access the user data and let unauthentic person not able to access the data

    // check the user is authentic or not by phone Number

    // console.log("phone No,", data.queryStringObject.phone);

    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    
    if(phone)
    {
        console.log('handlers.phone',phone);
        //get the token from the headers

        // console.log('data.headers.token',data)
        // console.log('data.headers.token.trim.length',data.headers.token.trim().length)
        var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
        // console.log('handlers.token',token)
        handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
            if(tokenIsValid)
            {
                //Lookup the user
                _data.read('users',phone,(err,data) => {
                    if (!err && data)
                    {
                        //Remove the hash encripted password from the user object before returing to the requester;
                        delete data.hashedPassword;
                        callback(200,data);
                    }
                    else
                    {
                        callback(404,{'Error':'User Doesnot Exist'});
                    }
                });

            }
            else
            {
                callback(400,{'Error':'token is not valid session expire'});
            }
        });
    }
    else
    {
        callback(400,{'Error':'missing require field - phone No.'})
    }

};



//User - put
//Required Data - Phone
// optional data - first name, last name, password
//@TODO let the authentic update the object

handlers._users.put = (data,callback) => {

    //check the required field

    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // check atleast one of the optional field

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    if(phone)
    {
        if(firstName || lastName || password)
        {
            //Veriy the token wheather it is valid or not
            var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

            handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
                if(tokenIsValid)
                {
                        // lookup into the user collection
                    _data.read('users',phone,(err,userData) => {    
                        if(!err && userData)
                        {
                            //update the necessary field
                            if(firstName)
                            {
                                userData.firstName = firstName;
                            }

                            if(lastName)
                            {
                                userData.lastName = lastName;
                            }
                            if(password)
                            {
                                userData.hashedPassword = helpers.hash(password);
                            }

                            // store into the disk and file

                            _data.update('users',phone,userData,(err) => {
                                if(!err)
                                {
                                    callback(200,{'Status': `userData successfully updated for this user ${phone}`});
                                }
                                else
                                {
                                    // console.log('userdata update error : ', err); 
                                    callback(500,{'Error':'could updat the user'});
                                }
                            });
                            
                        }
                        else
                        {
                            callback(400,{'Error':'Specified user doesnot exist'});
                        }
                    });

                }
                else
                {
                    callback(400,{'Error':'session / token is expired'});
                }
            });
            
        }
        else
        {
            callback(400,{'Error':'Missing required filed fill atleast one option'});
        }
    }
    else
    {
        callback(400,{'Error':'phone number is invalid'});
    }

};
//User - delete
// Required Data : phone
// optional data : null
//@TODO let the authentic person delete the record
handlers._users.delete = (data,callback) => {

    var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
    if(phone)
    {
        //check is token expired or not

        var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;

        handlers._tokens.verifyToken(token,phone,(tokenIsValid) => {
            if(tokenIsValid)
            {
                _data.read('users',phone,(err,userData) => {
                    if(!err && userData)
                    {
                        // console.log('usersdata checks :',userData)
                        _data.delete('users',userData.phone,(err) => {
                            if(!err)
                            {
                            // callback(200,{'Status_update':`${phone} user successfully deleted`});

                            //Delete each of the checks associated with the users
                            var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                            var checksToDelete = userChecks.length;
                            if(checksToDelete > 0)
                            {
                                var checksDeleted = 0;
                                var deletionErrors = false;

                                //Loop through the errors

                                userChecks.forEach(checkId => {
                                    //Delete the checks
                                    _data.delete('checks',checkId,(err) => {
                                        if(err)
                                        {
                                            deletionErrors = true;
                                        }
                                        checksDeleted++;
                                        if(checksDeleted == checksToDelete)
                                        {
                                            if(!deletionErrors)
                                            {
                                                callback(200,{'Status_update':`${phone} user successfully deleted`});
                                            }
                                            else
                                            {
                                                callback(500,{'Error':'Errors encounted while attempting to delete the checks all checks may not be deleted successfully'})
                                            }
                                        }
                                    });
                                });
                            }
                            else
                            {
                                callback(200,{'Status_update':`${phone} user successfully deleted`});
                            }
                        }
                        else
                        {
                            callback(500,{'Error':'Delete Operation failed'})
                        }
                        });                        
                    }
                    else
                    {
                        callback(500,{'Error':'Delete operation not able to perfrom'})
                    }
                });
            }
            else
            {
                callback(400,{'Error':'Token / Session Exipred'});
            }
        });
    }
    else
    {
        callback(400,{'ERROR':'User doesnot exist'});
    } 
};


//Tokens

handlers.tokens = (data, callback) => {
    var acceptableMethods = ['post','put','get','delete'];
    console.log("tokens data method ",data.method)
    console.log("tokens data method ",data)
    console.log("indexof methd",acceptableMethods.indexOf(data.method));
    if (acceptableMethods.indexOf(data.method) > -1)
    {
        console.log("handlers toke");
        handlers._tokens[data.method](data,callback);
    }
    else
    {
        callback(405,{'Status Code' : 'Methods Not Allowed in token'});  
    }
};


//Containers for the token
handlers._tokens = {};


// Token for Post
//Require data : phone & password
//optional data : none
handlers._tokens.post = (data,callback) => {
    // console.log('handlers._token',data.payload);
    console.log("handlers token post called")
    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    
    if(phone)
    {
        if(password)
        {
            //lookup the user who mathes that phone number
            _data.read('users',phone,(err,userData) => {
                if(!err && userData)
                {
                    //hash the sent password and compair it into the stored password
                    var hashedPassword = helpers.hash(password);

                    //compair the hashed password
                    if(hashedPassword == userData.hashedPassword)
                    {
                        //If password is valid then create the new token for that specified users for the particular time period
                        var tokenId = helpers.createRandomString(20);
                        //Expiry of the token
                        var expires = Date.now() + 1000 * 60 * 60;

                        var tokenObject = {
                            'phone' : phone,
                            'Id' : tokenId,
                            'expires': expires
                        };

                        //Store the token
                        _data.create('tokens',tokenId,tokenObject,(err) => {
                            if(!err)
                            {
                                callback(200,tokenObject);
                            }
                            else
                            {
                                callback(400,{'Error':'Failed to generate the token Id'});
                            }
                        });
                    }
                    else
                    {
                        callback(400,{'Error':'Password doesnot match'});
                    }
                }
                else
                {
                    callback(404,{'Error':'Could found the specified users'});
                }
            });
        }
        else
        {
            callback(404,{'Error':'Password field is empty please enter the password'});
        }

    }
    else
    {
        callback(404,{'Error':'Please enter the phone Number'});
    }
};

// Token for get
//required data : ID
// optional : none
handlers._tokens.get = (data,callback) => {
    console.log("handlers token get called")
    //check wheather ID is valid or not
    // console.log('data Id',data )
    var Id = typeof(data.queryStringObject.Id) == 'string' && data.queryStringObject.Id.trim().length == 20 ? data.queryStringObject.Id.trim() : false;

    //lookup the token
    _data.read('tokens',Id,(err,tokenData) => {
        if(!err && tokenData)
        {
            callback(200,tokenData);
        }
        else
        {
            console.log('not accept')
            callback(400,{'Error':'Id doesnot Exist'});
        }
    });

};

// Token for put
//required data, id, extent
//optional data: none
handlers._tokens.put = (data,callback) => {
    console.log("handlers token put called")
    var Id = typeof(data.payload.Id) == 'string' && data.payload.Id.trim().length == 20 ? data.payload.Id.trim() : false;
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    //lookup the tooken

    _data.read('tokens',Id,(err,tokenData) => {
        if(!err && tokenData)
        {
            if(tokenData.expires > Date.now())
            {
                tokenData.expires = Date.now()+1000*60*60;

                //Store the token into file
                _data.update('tokens',Id,tokenData,(err) => {
                    if(!err)
                    {
                        callback(200,{'Status':'Exipry date has been exptended'});
                    }
                    else
                    {
                        callback(200,{'Error':'Could not update the new expiry date'});
                    }
                });
            }
            else
            {
                callback(400,{'Error':'Token already expired'});
            }

        }
        else
        {
            callback(400,{"Error":"Specified token doesnot available in record"});
        }
    });

};

// Token for delete
//Require data : Id
handlers._tokens.delete = (data,callback) => {
    console.log("handlers token delete called enter")
    var Id = typeof(data.queryStringObject.Id) == 'string' && data.queryStringObject.Id.trim().length == 20 ? data.queryStringObject.Id.trim() : false;
    console.log("handlers token delete called ID",data.queryStringObject);
    console.log("handlers token delete called ID",Id);
    _data.read('tokens',Id,(err,data) =>{
        if(!err && data)
        {
            console.log("handlers token delete called  read",data);
            _data.delete('tokens',Id,(err) => {
                if(!err)
                {
                    console.log("handlers token delete called  delete err",err);
                    callback(200,{'Status':'Successfully deleted'});
                }
                else
                {
                    callback(500,{'Error':'Not able to delete the token'}); 
                }
            });
        }
        else
        {
            console.log("handlers token delete called  err 400",err);
            callback(400,{'Error':'Missing required field'});
        }
    });
};


//Verify that if the given token is valid for specifify user or not

handlers._tokens.verifyToken = (id,phone,callback) => {
    //lookup the token
    _data.read('tokens',id,(err,tokenData) => {
        if(!err && tokenData)
        {
            //check that the token is for the given user and valid and not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now())
            {
                callback(true);
            }
            else
            {
                callback(false);
            }

        }
        else
        {
            callback(false);
        }
    });
};

//Checks Handlers

handlers.checks = (data, callback) => {
    var acceptableMethods = ['post','put','get','delete'];
    // console.log("data method ",data.method)
    // console.log("indexof methd",acceptableMethods.indexOf(data.method));
    if (acceptableMethods.indexOf(data.method) > -1)
    {
        // console.log("accept data",data);
        handlers._checks[data.method](data,callback);
    }
    else
    {
        callback(405,{'Status Code' : 'Methods Not Allowed in token'});  
    }
};

//Checks Containeres

handlers._checks = {};

// Checks for post
//Required data : protocol,url, methods, successcodes, timeOutSeonds
//Optionals data : none; 
handlers._checks.post = (data,callback) => {
    
    // console.log('data.payload.protocol',['http','https'].indexOf(data.payload.protocol));
    // console.log('data.payload.url',data.payload.url)
    // console.log('data.payload.method',data.payload.method);
    // console.log('data.payload.successCodes',data.payload.successCodes)
    // console.log('typeof(data.payload.timeOutSeonds)',typeof(data.payload.timeOutSeconds))
    // console.log('data.payload.timeOutSeonds % 1',(data.payload.timeOutSeconds % 1))
    // console.log('data.payload.timeOutSecond',data.payload.timeOutSeconds >= 1)
    // console.log('data.payload.timeOutSecond',data.payload.timeOutSeconds <= 5)
    //Validated input
    var protocol = typeof(data.payload.protocol) == 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post','put','get','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;    
    var timeOutSeonds = typeof(data.payload.timeOutSeconds) == 'number' && data.payload.timeOutSeconds % 1 === 0 && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <=5 ? data.payload.timeOutSeconds : false;
       
    if(protocol)
    {
        if(url)
        {
            if(method)
            {
                if(successCodes)
                {
                    if(timeOutSeonds)
                    {
                        //get the tokens from the headers
                        var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
                        
                        //Lookup the token
                        _data.read('tokens',token,(err,tokenData) => {
                            if(!err && tokenData)
                            {
                                var userPhone = tokenData.phone;

                                //Lookup the user data
                                // console.log('userphone',tokenData.phone)
                                _data.read('users',userPhone,(err,userData) => {
                                    if(!err && userData)
                                    {
                                        // console.log('checks user data',userData.checks);
                                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                        // Verfity that users has less checks than the number of Max Checks per users
                                        if(userChecks.length < config.maxChecks)
                                        {
                                            // Create a Random Id for the checks
                                            var checkId = helpers.createRandomString(20);

                                            //Create the checks objects
                                            var checkObject = {
                                                'checkId' : checkId,
                                                'userPhone' : userPhone,
                                                'protocol' : protocol,
                                                'url' : url,
                                                'method' : method,
                                                'successCodes' : successCodes,
                                                'timeOutSeconds' : timeOutSeonds
                                            };

                                            //save the object to the disk

                                            _data.create('checks',checkId,checkObject,(err) => {
                                                if(!err)
                                                {
                                                    //add the check id to save the user's object
                                                    userData.checks = userChecks;
                                                    userData.checks.push(checkId);

                                                    // save the new user data

                                                    _data.update('users',userPhone,userData,(err) => {
                                                        if(!err)
                                                        {
                                                            //Return the data about the new checks
                                                            callback(200,checkObject);
                                                        }
                                                        else
                                                        {
                                                            callback(500,{'Error':'Could not update the new checks'});
                                                        }
                                                    });
                                                }
                                                else
                                                {
                                                    callback(500,{'Error':'Could Not create the new checks'});
                                                }
                                            });
                                        }
                                        else
                                        {
                                            callback(400,{'Error' : ' Users has the maximum numbers of checks('+config.maxChecks+')'});
                                        }
                                    }
                                    else
                                    {
                                        callback(403,{'Error':'User data doesnot exist or available'});
                                    }
                                });
                            }
                            else
                            {
                                callback(403,{'Error':'User not allowed'});
                            }
                        });
                    }
                    else
                    {
                        callback(400,{'Error':'checks is timeout'});
                    }
                }
                else
                {
                    callback(400,{'Error':'Successcode is invalid or missing'});
                }
            }
            else
            {
                callback(400,{'Error':'methods is invalid or missing'});
            }

        }
        else
        {
            callback(400,{'Error':'url is invalid or missing'});
        }
    }
    else
    {
        callback(400,{'Error':'protocol is invalid or missing'});
    }

};


// Checks for get

handlers._checks.get = (data,callback) => {

        //Users-GET
    //Required data = Id
    //Optional DATA - none
    //@TODO Only let the authentic user to access the user data and let unauthentic person not able to access the data

    // check the user is authentic or not by phone Number

    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    
    if(id)
    {

        //Lookup the id

        _data.read('checks',id,(err,checkData) => {
            // console.log('checksdata put',checkData)
            if(!err && checkData)
            {
                //get the token from the headers
                // console.log('data.headers.token',data.headers.token)
                var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
                handlers._tokens.verifyToken(token,checkData.userPhone,(tokenIsValid) => {
                    if(tokenIsValid)
                    {
                        callback(200,checkData)
                    }
                    else
                    {
                        callback(400,{'Error':'token is not valid session expire for the checks'});
                    }
                });
            }
            else
            {
                callback(400,{'Error':'checks required data is missing'});
            }
        });
    }
    else
    {
        callback(400,{'Error':'missing require field - phone No.'})
    }

};

// Checks for put
//Required data = Id
//Optional Data = protocol, url, methods, successcode, timeoutsecond

handlers._checks.put = (data,callback) => {
     // Check the required field        
    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    //check the optional field

    var protocol = typeof(data.payload.protocol) == 'string' && ['http','https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    var url = typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;
    var method = typeof(data.payload.method) == 'string' && ['post','put','get','delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    var successCodes = typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;    
    var timeOutSeconds = typeof(data.payload.timeOutSeconds) == 'number' && data.payload.timeOutSeconds % 1 === 0 && data.payload.timeOutSeconds >= 1 && data.payload.timeOutSeconds <=5 ? data.payload.timeOutSeconds : false;

    if(id)
    {
        if(protocol || url || method || successCodes || timeOutSeonds)
        {
            _data.read('checks',id,(err,checkData) => {
                //get the token from the headers
                var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

                //Verify the tokens
                handlers._tokens.verifyToken(token,checkData.userPhone,(tokenIsValid) => {
                    if(tokenIsValid)
                    {
                        if(protocol)
                        {
                            checkData.protocol = protocol;
                        }
                        if(url)
                        {
                            checkData.url = url;
                        }
                        if(method)
                        {
                            checkData.method = method;
                        }
                        if(successCodes)
                        {
                            checkData.successCodes = successCodes;
                        }
                        if(timeOutSeconds)
                        {
                            checkData.timeOutSeconds = timeOutSeconds;
                        }

                        // Store the new data
                        _data.update('checks',id,checkData,(err) => {
                            if(!err)
                            {
                                callback(200,{"Status":" check verified and check field updated"});
                            }
                            else
                            {
                                callback(500,{'Error':'Could Not update'});
                            }
                        });

                    }
                    else
                    {
                        callback(400,{'Error':'check Token Id doesnot exist'});
                    }
                });
            });
        }
    }
    else
    {
        callback(400,{'Error':'Id is invalid'});
    }


};

// Checks for delete
//Required Data - id
// optional data - null
handlers._checks.delete = (data,callback) => {
    var id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(id)
    {
        //Lookup the checks in check folder
        _data.read('checks',id,(err,checkData) => {
            if(!err && checkData)
            {
                //Get the token from the Headers
                var token = typeof(data.headers.token) == 'string' && data.headers.token.trim().length == 20 ? data.headers.token.trim() : false;
                // Verify that the given token is valid for the user or not
                handlers._tokens.verifyToken(token,checkData.userPhone,(tokenIsValid) => {
                    if(tokenIsValid)
                    {
                        //Delete the check data
                        _data.delete('checks',id,(err) => {
                            if(!err)
                            {
                                //remove the checks from the users file
                                _data.read('users',checkData.userPhone,(err,userData) => {
                                    if(!err && userData)
                                    {
                                        var userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];

                                        //Remove the checks list from the users checks\
                                        var checkPostition = userChecks.indexOf(id);
                                        if(checkPostition > -1)
                                        {
                                            userChecks.splice(checkPostition,1)
                                            //Re-save the users data
                                            _data.update('users',checkData.userPhone,userData,(err) => {
                                                if(!err)
                                                {
                                                    callback(200,{'Status':'Successfully update by checks reomving'});
                                                }
                                                else
                                                {
                                                    callback(500,{'Error':'Could not update the users'});
                                                }
                                            } );
                                        }
                                        else
                                        {
                                            callback(500,{'Error':'Cou;d not find the checks in the user objects'})
                                        }
                                    }
                                    else
                                    {
                                        callback(500,{'Error':'User doesnot exist for the coresponding checks ID'});
                                    }
                                });
                            }
                            else
                            {
                                callback(400,{'Error':'Checks file is not available'});
                            }
                        });
                    }
                    else
                    {
                        callback(403,{'Error':'Token is not valid'});
                    }
                });
            }
            else
            {
                callback(400,{'Error':'check is not valid and doesnot exist'});
            }
        });
    }
    else
    {
        
        callback(400,{'Error':'Required token is invaid'});
    }
};


//Favicon handlers

handlers.favicon = (data,callback) => {
    //Reject the reqest if the request is not get

    if(data.method == 'get')
    {
        //Read in the favicon data
        helpers.getStaticAsset('favicon.ico',(err,data) => {
             if(!err)
             {
                if(data)
                {
                    //Callback the data
                    callback(200,data,'favicon');
                }
                else
                {
                    callback(500,{'Error':'Favicon data issue'})
                }
             }
             else
             {
                 callback(500,{'Error':'there is an error to get the favicon.ico'})
             }
        });
    }
    else
    {
        callback(405,{'Error' : 'Method request is not get for favicon'});
    }
};

//Public Assets

handlers.public = (data,callback) => {
    //Reject the reqest if the request is not get

    if(data.method == 'get')
    {
        //Get the file name being requested
        //inorder to figure out what the public asset asking for we need to trim the work public dir of the string in the path
        // console.log('handlers,public',data);
        var trimmedAssetName = data.trimmedpath.replace('public/','').trim();
        if(trimmedAssetName.length > 0)
        {
            //Read in the asset data
            helpers.getStaticAsset(trimmedAssetName,(err,data)=> {
                if(!err)
                {
                    if(data)
                    {
                        //Determine the content type and default the plain text if we will not figure it out.
                        var contentType = 'plain'
                        
                        if(trimmedAssetName.indexOf('.css') > -1)
                        {
                            contentType = 'css';
                        }
                        
                        if(trimmedAssetName.indexOf('.png')> -1)
                        {
                            contentType = 'png';
                        }

                        if(trimmedAssetName.indexOf('.jpeg')> -1)
                        {
                            contentType = 'jpeg';
                        }

                        if(trimmedAssetName.indexOf('.ico')> -1)
                        {
                            contentType = 'favicon';
                        } 

                        // then we call the callback data
                        // console.log('handlers data' + data +'\n\n\t content ype \t' + contentType)
                        callback(200,data,contentType);
                    }
                    else
                    {
                        callback(500,{'Error':'There is some error in getting the public asset'});
                    }
                }
                else
                {
                    callback(500,{'Error':'There is an error to collecting the data'});
                }
            });
        }
        else
        {
            callback(404,{'Error':'There is no string in the dir for public assset'});
        }
    }
    else
    {
        callback(405,{'Error' : 'Method request is not the GET on public asset handlers'});
    }
};

//ping Handlers

handlers.ping = (data, callback) => {
    callback(200,{'ping' : 'Server Alive'});
};

//Not found Handlers

handlers.notFound = (data, callback) => {
callback(404, {'handlers':'not found'});
};

//Export Modules

 module.exports = handlers;