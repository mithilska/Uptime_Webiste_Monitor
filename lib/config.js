/*
*
*Create and export configuration variable
*
*/

// Container for all the variables

var environments = {};

//Staging ( Default) environments

environments.staging = {

    'httpport' : 3000,
    'httpsport' : 3001,
    'envName' : 'staging',
    'hashingSecret' : 'thisIsASecret',
    'maxChecks' : 5,
    'twilio' :
    {
        'accountSid' : 'AC31d9b50a0fa12e3f0dacf7fe51c016d3',
        'authToken' : '65aaa02f4c2082002a7fa7cd67870c73',
        'fromPhone' : '+12013895617'
    },
    'templateGlobals' :
    {
        'appName' : 'UptimeChecker',
        'companyName' : 'Mithil Agarwal',
        'yearCreated' : '2020 Under Testing',
        'baseUrl' : 'http://localhost:3000/'
    }

};

// Production Environments

environments.production = {

    'httpport' : 5000,
    'httpsport' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'thisIsAlsoASecret',
    'maxchecks' : 5,
    'twilio' : 
    {
        'accountSid' : 'AC31d9b50a0fa12e3f0dacf7fe51c016d3',
        'authToken' : '65aaa02f4c2082002a7fa7cd67870c73',
        'fromPhone' : '+12013895617'
    },
    'templateGlobals' :
    {
        'appName' : 'UptimeChecker',
        'companyName' : 'Mithil Agarwal',
        'yearCreated' : '2020',
        'baseUrl' : 'http://localhost:5000/'
    }

};

//Determine Which environment was passed in command line Interface
console.log(process.env.NODE_ENV);

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

// Checck the current enviroment is one of the environment above, then stagging will be default

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

// Export the environment

module.exports = environmentToExport;