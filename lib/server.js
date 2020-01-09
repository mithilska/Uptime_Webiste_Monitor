/*
*
* Server- related task
*
*/

//Dependences
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const _data = require('./data');
const handlers = require('./handlers');
const helpers = require('./helpers');
const path = require('path');

//Initilize the server module objects

var server = {};

// //@TODO get rid of this
//     helpers.sendTeilioSms('9462169537','This is how it works',(err) => {
//         console.log('this was the error for sending sms : '+err);
//     });

// Server should respond to all the requests with the string on http server
server.httpServer = http.createServer((req, res) =>
{
    server.unifiedServer(req,res);
}).listen(config.httpport,() =>
{
    console.log("Server started at port : " + config.httpport + " in " + config.envName + " now");
});

// Http server SSL key define

server.httpsServerOption = {

    'key' : fs.readFileSync(path.join(__dirname,'/../https/key.pem')),
    'cert' : fs.readFileSync(path.join(__dirname,'/../https/cert.pem'))
};

// Server should respond to all the requests with the string on https server
server.httpsServer = https.createServer(server.httpsServerOption,(req, res) =>
{
    server.unifiedServer(req,res);
}).listen(config.httpsport,() =>
{
    console.log("1. Server started at port : " + config.httpsport + " in " + config.envName + " now");
});

//All the server logic for both http and https server

server.unifiedServer = (req,res) => {

    // console.log("\n\n\t 2. req.url = ", req.url)
    //get the URL and parse
    var parseUrl = url.parse(req.url,true);
    // console.log("\n\n\t 3. parseUrl = ", parseUrl);

    // Get the path
    var path = parseUrl.pathname;
    var trimmedpath = path.replace(/^\/+|\/+$/g,'');

    // console.log('\n\t 4. trimmedpath : ',trimmedpath);               //remove it

    // get the HTTP Method
    var method = req.method.toLowerCase();
    // console.log("\n\t 5. method : ",method);                        // remove it
    //Get the query string as an object
    // console.log('parseUrl : ', parseUrl.query )
    var queryStringObject = parseUrl.query;
    console.log('query string', queryStringObject);


    //Get the Header as an object
    var headers = req.headers;
    // console.log("\n\t 7. Headers : ",headers);                      //Remove it
    // Get the payload, if any

    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data',(data) => {
        buffer += decoder.write(data);
        // console.log("buffer before end", buffer)
    });
    req.on('end',() => {
        buffer += decoder.end();
        
        //Choose the handler that request go to. If one is not found than, than use the not found hanfler

        var choosenHandler = typeof(server.router[trimmedpath]) !== 'undefined' ? server.router[trimmedpath] : handlers.notFound;
    
        //If the requset is in the public directory use the public handers

        choosenHandler = trimmedpath.indexOf('public/') > -1 ?  handlers.public : choosenHandler;

        //Construct the data object to send to the handler

        var data = {
            'trimmedpath' : trimmedpath,
            'queryStringObject' : queryStringObject,
             'method' : method,
             'headers' : headers,
             'payload' : helpers.parseJsonToObject(buffer)
        };
        console.log('data.payload test',data);

        // Route the request that specifity into the router

        choosenHandler(data,(statusCode,payload,contentType) => {
            
            //Determine the type of response (fallback to JSON)

            contentType = typeof(contentType) == 'string' ? contentType : 'json';
         
            // console.log('plain',contentType)
         
            // use the status code callback by the handler or default to 200

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            

            //Return the response part that are content-specific
            var payloadString = '';
            
            // If the content type is JSON
            if(contentType == 'json')
            {
                res.setHeader('Content-Type','application/json');
                //use the payload callback by the handler or default to the empty object
                payload = typeof(payload) == 'object' ? payload : {};
                payloadString = JSON.stringify(payload);
            }
            // If the content type is html
            if(contentType == 'html')
            {
                res.setHeader('Content-Type','text/html');
                payloadString = typeof(payload) == 'string' ? payload : '';
                
            }

             // If the content type is favicon
             if(contentType == 'favicon')
             {
                 res.setHeader('Content-Type','image/x-icon');
                 payloadString = typeof(payload) !== 'undefined' ? payload : '';
                //  console.log('get static asset',payloadString)
             }

              // If the content type is css
            if(contentType == 'css')
            {
                res.setHeader('Content-Type','text/css');
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
                
            }

             // If the content type is png
             if(contentType == 'png')
             {
                 res.setHeader('Content-Type','image/png');
                 payloadString = typeof(payload) !== 'undefined' ? payload : '';
                 
             }

              // If the content type is jpeg
            if(contentType == 'jpeg')
            {
                res.setHeader('Content-Type','image/jpeg');
                payloadString = typeof(payload) !== 'undefined' ? payload : '';
                
            }
             // If the content type is plain
             if(contentType == 'plain')
             {
                 res.setHeader('Content-Type','text/plain');
                 payloadString = typeof(payload) !== 'undefined' ? payload : {};
                 
             }
            //Return the response parts that are common to all content-types 
            res.writeHead(statusCode);
            res.end(payloadString);
            
            // Log the request path

            console.log('\n\nReturn the response where \"Status Code\" ---- '+ statusCode +" \"ContentType\" ---- " + contentType);
        });


    });
}


//Request router defined
server.router = {
    '' : handlers.index,
    'account/create' : handlers.accountCreate,
    'account/edit' : handlers.accountEdit,
    'account/delete' : handlers.accountDelete,
    'session/create' : handlers.sessionCreate,
    'session/deleted' : handlers.sessionDelete,
    'checks/all' : handlers.checkList,
    'checks/create' : handlers.checksCreate,    
    'checks/edit' : handlers.checksEdit,
    'ping' : handlers.ping,
    'api/users' : handlers.users,
    'api/tokens' : handlers.tokens,
    'api/checks' : handlers.checks,
    'favicon.ico' : handlers.favicon,
    'public' : handlers.public

};

//Export the whole servers

module.exports = server;