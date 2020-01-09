/*
*
*Workers related task
*
*/

const path = require('path');
const fs = require('fs');
const _data = require('./data');
const https = require('https');
const http = require('http');
const helpers = require('./helpers');
const url = require('url');
var _logs = require('./logs');

//Initialize the worker objects
var workers = {};


//Looks all the checks, get their data, send to validators

workers.gathersAllChecks = () => {
    //Get the all the checks
    _data.list('checks',(err,checks) => {
        if(!err)
        {
            if(checks && checks.length > 0)
            {
                checks.forEach((check) => {
                    //Read in the checks data 

                    _data.read('checks',check,(err,originalCheckData) => {
                        if(!err && originalCheckData)
                        {
                            //Pass the data to the check validator ad let that function continue or log error as needed
                            workers.validateCheckData(originalCheckData);
                        }
                        else
                        {
                            console.log("Error reading one of the check from the data called originalCheckData");
                        }
                    });
                });
            }
            else
            {
                console.log("Length error");
            }
        }
        else
        {
            console.log('There is an error while checking the checks');
        }
    });
};

//Sanity-check the check-data

workers.validateCheckData = (originalCheckData) => {
    // console.log('originalCheckData',originalCheckData);
    originalCheckData = typeof(originalCheckData) == 'object' && originalCheckData !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.checkId) == 'string' && originalCheckData.checkId.trim().length == 20 ? originalCheckData.checkId.trim() : false;
    originalCheckData.userPhone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
    originalCheckData.protocol = typeof(originalCheckData.protocol) == 'string' && ['http','https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url = typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url.trim() : false;
    originalCheckData.method = typeof(originalCheckData.method) == 'string' && ['post','put','get','delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes = typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > -1 ? originalCheckData.successCodes : [];
    originalCheckData.timeOutSeconds = typeof(originalCheckData.timeOutSeconds) == 'number' && originalCheckData.timeOutSeconds > 0 && originalCheckData.timeOutSeconds <=5 && originalCheckData.timeOutSeconds % 1 === 0 ? originalCheckData.timeOutSeconds : false;
    // console.log('originalCheckData',originalCheckData.timeOutSeconds)
    //set the keys that may not be set (if the workers has never seen the check before)

    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up','down'].indexOf(originalCheckData.state) > -1 ? originalCheckData.state : 'down';
    originalCheckData.lastChecks = typeof(originalCheckData.lastChecks) == 'number' && originalCheckData.lastChecks > 0 ? originalCheckData.lastChecks : false;

    //If all the check pass, pass the data to the along step in the process

    if(originalCheckData.id)
    {
        if(originalCheckData.userPhone)
        {
            if(originalCheckData.protocol)
            {
                if(originalCheckData.url)
                {
                    if(originalCheckData.method)
                    {
                        if(originalCheckData.successCodes)
                        {
                            if(originalCheckData.timeOutSeconds)
                            {
                                workers.performCheck(originalCheckData);
                            }
                            else
                            {
                                console.log('Timeout second is missing');
                            }
                        }
                        else
                        {
                            console.log('Successcode is missing');
                        }
                    }
                    else
                    {
                        console.log('Original check data method is missing');
                    }
                }
                else
                {
                    console.log('URL is missing in original check data');
                }
            }
            else
            {
                console.log('protocol is missing');
            }
        }
        else
        {
            console.log('Original Check data user Phone is invalid');
        }
    }
    else
    {
        console.log('Original Check data ID is missing')
    }
};


//Perform the checks send the originalCheckData and the outcome to the check process to the next step to the process

workers.performCheck = (originalCheckData) => {
    //prepair the initial check outcome

    var checkOutCome = {
        'error' : false,
        'responseCode' : false
    }

    //mark that the outcome is not sent it yet
    var outcomeSent = false;

    //parse the hostname and the path out of the original check data
    var parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url,true);
    var hostName = parsedUrl.hostname;
    var path = parsedUrl.path; // Using path and not "pathname" because we want the query string

    //Construct the request

    var requestDetails  = {
        'protocol' : originalCheckData.protocol+':',
        'hostname' : hostName,
        'method' : originalCheckData.method.toUpperCase(),
        'path' : path,
        'timeOut' : originalCheckData.timeOutSeconds*1000
    };

    //Iniciiate the request object using either https or https module

    var _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
    var req = _moduleToUse.request(requestDetails,(res) => {
        var status = res.statusCode;

        //Update the check outcome and pass the data along

        checkOutCome.responseCode = status;
        if(!outcomeSent)
        {
            workers.processCheckOutcome(originalCheckData,checkOutCome);
            outcomeSent=true;
        }
    });

    //Bind to the error event so it doesnot get throw
    req.on('error',(e) => {
        //Update the check outcome and pass the data along
        checkOutCome.error = {
            'error' : true,
            'value' : e
        };

        if(!outcomeSent)
        {
            workers.processCheckOutcome(originalCheckData,checkOutCome);
            outcomeSent = true;
        } 
    });

    //Bind to the time out
    req.on('timeout',(e) => {
        checkOutCome.timeOut = {
            'Error' : true,
            'Value' : 'timeOut'   
        }
    });

    //End the req
    req.end();

};

//Process the checkout, update the check data as needed triggered an alert if needed;
//SPecial logic for accomadtiting a check that has never been tested before (dont alert for that )

workers.processCheckOutcome = (originalCheckData,checkOutCome) => {
    //Decide if the check is consider up or down 

    var state = !checkOutCome.error && checkOutCome.responseCode && originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1 ? 'up' : 'down';

    //Decide if an alert is warranted

    var alertWarrented = originalCheckData.lastChecks && originalCheckData.state !== state ? true : false;

    // log the outcome

    var timeOfCheck = Date(Date.now());

    workers.log(originalCheckData,checkOutCome,state,alertWarrented,timeOfCheck.toString());
    //update the check data

    var newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecks = Date.now();
    // console.log('newcheckdata',newCheckData);
    // console.log('New Check Data :'+newCheckData+' State  :' + state + 'alertWarrented :' +alertWarrented);
    //Save the update

    _data.update('checks',newCheckData.id,newCheckData,(err) => {
        if(!err)
        {
            //Send the new check to the next phase to the process if needed
            if(alertWarrented)
            {
                workers.alertuserToStatusChange(newCheckData);
            }
            else
            {
                console.log('Check outcome has not changed, no alert is needed');
            }
        }
        else
        {
            console.log('Error while saving the data to one of the checks');
        }
    });
};

//Alert the user as to change in their check status

workers.alertuserToStatusChange = (newCheckData) => {
var msg = 'Alert your new check data for ' + newCheckData.method.toUpperCase()+' '+newCheckData.protocol+'://'+newCheckData.url+' is Currently ' + newCheckData.state;
helpers.sendTeilioSms(newCheckData.userPhone,msg,(err) => {
    console.log('sms err',err)
    if(!err)
    {
        console.log('success : user was alert to a status change in the check via sms');
    }
    else
    {   
        console.log('Error could not send sms alert who had a state change ');
    }
});
};


//log generate 

workers.log = (originalCheckData,checkOutCome,state,alertWarrented,timeOfCheck) => {
    //Form tthe log data

    
    var logData = {
        'check' : originalCheckData,
        'outcome' :checkOutCome,
        'state' : state,
        'alert' : alertWarrented,
        'time' :  timeOfCheck
    };

    // Convert the log data into string format
    var logString = JSON.stringify(logData);
    // console.log('logString',logString);

    //Determine the name of the log file
    var logFileName = originalCheckData.id;
    // console.log('logfilename',logFileName)

    _logs.append(logFileName,logString,(err) => {
        if(!err)
        {
            console.log("logging the file successed");
        }
        else
        {
            console.log("\n\nlogging the file failed",err);
        }
    });

};

//Rotate (compress) the log file

workers.rotateLogs = () => {
    //Listing all the non compress log files
    _logs.list(false,(err,logs) => {
        if(!err)
        {
            if(logs && logs.length > 0)
            {
                logs.forEach((logName) => {
                    //Compress the data to the different file
                    var timeStamp = Date(Date.now());
                    var logId = logName.replace('.logs','');
                    var newFileId = logId;

                    _logs.compress(logId,newFileId,(err) => {
                        if(!err)
                        {
                            //Truncate the logs
                            _logs.truncate(logId,(err) => {
                                if(!err)
                                {
                                    callback('Success truncating log file');
                                }
                                else
                                {
                                    callback('Error truncating logFile');
                                }
                            });
                        }
                        else
                        {
                            console.log('Error compressing one of the log files',err);
                        }
                    });
                });
            }
            else
            {
                callback('could not find any logs file for rotating');
            }
        }
        else
        {
            console.log('could not fine any logs to rotate and zip it');
        }
    });
};



//Timer to execte the workers-process one per minute
workers.loop = () => {
    setInterval( () => {
        workers.gathersAllChecks();
    },1000*60);
};

// Timer to execute the logs rotation process once per day
workers.logRotationLoop = () => {
    setInterval( () => {
        workers.rotateLogs();
    },1000*60*60*24);
};

//Init Workers

workers.init = () => {
    //Execute all the checks imediately
    workers.gathersAllChecks();
    
    //call the loop so the checks will execute later on
    workers.loop();

    //Compress the logs immediately
    workers.rotateLogs();

    //Call the compression loop so log will be compressed later on
    workers.logRotationLoop();


}

//Export the workers
module.exports = workers;