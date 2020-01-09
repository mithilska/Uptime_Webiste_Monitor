/*
*
* Primary files for API
*
*/

//Dependences

var server = require('./lib/server');
var workers = require('./lib/workers');

//Declare the app

var app = {};

//Initialition function - INIT

app.init = () => {

    //Start the server
    // server.init();

    //Start the workers
    workers.init();
};

//Execute the app function
app.init();

//Export the app
module.exports = app;