/*
*
* Frontend logic for the application 
*
*/

//This is the container for the front end application
var app = {};

//Config the object of container APP

app.config = {
    'sessionToken' : false
};

//AJAX Client for the restful API

app.client = {}; // is an empty object for th client side ajax request

//app.client.request for interface for making the API Call

app.client.request = function (headers,path,method,queryStringObject,payload,callback)
 {
     console.log("app client request")
    //Set Default and check the parameters
    // console.log('before payload',payload);
    headers = typeof(headers) == 'object' && headers !==null ? headers : {};
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['GET','PUT','POST','DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
    payload = typeof(payload) == 'object' && payload !== null ? payload : {};
    callback = typeof(callback) == 'function' ? callback : false;
    console.log('after payload method ',headers);
    console.log('after payload path',path);
    console.log('after payload method',method);
    console.log('after payload querystring',JSON.stringify(queryStringObject));
    console.log('after payload',payload);
    console.log('after payload',callback);
    /* 
    we normally do not check callback parameter like that but we do it because we want to make the app.client.request using with
    or without callback function, so due to this we have asign false to this callback by default if we do not want the callback. 
    */
       
    // For each query string parameter sent, add it to the path

    var requestUrl = path+'?';  //Here question mark is there so we can addon the parameter one after another
    var counter = 0;
    for (var queryKey in queryStringObject)
    {
        // First we have to make sure that it is the real key by using if condition
        if(queryStringObject.hasOwnProperty(queryKey))
        {
            counter++;

            //if at lease one query string parameter has already been added prepend new one with ampersand
            //In another words if the query string has full equalbars before we have to add ampersand

            if(counter > 1)
            {
                requestUrl += '&';
            }

            //Add the key value
            requestUrl+=queryKey+'='+queryStringObject[queryKey];
        }
    }
    //Form the http rewuest as a JSON Type

    var xhr = new XMLHttpRequest();

    xhr.open(method,requestUrl,true);
    xhr.setRequestHeader("Content-Type","application/json");

    //For each header sent, add it to the request one by one

    for(var headerKey in headers)
    {
        if(headers.hasOwnProperty(headerKey))
        {
            xhr.setRequestHeader(headerKey,headers[headerKey]);
        }
    }

    //if there is a current session token,add that as a header
    if(app.config.sessionToken)
    {
        xhr.setRequestHeader("token",app.config.sessionToken.id);
    }

    //When the request come back. handle the response

    xhr.onreadystatechange = function() {
        if(xhr.readyState ==  XMLHttpRequest.DONE)
        {
            var statusCode = xhr.status;
            var responseReturned = xhr.responseText;

            //Callback if requested
            if(callback)
            {
                try
                {
                    var parsedResponse = JSON.parse(responseReturned);
                    callback(statusCode,parsedResponse);
                }
                catch(e)
                {
                    callback(statusCode,false);
                }
            }
        }
    };

    //Send the payload as JSON

    var payloadString = JSON.stringify(payload);
    // console.log(payloadString)
    xhr.send(payloadString);

};


//bind the form

app.bindForms = function() {
    if(document.querySelector('form'))
    {
        document.querySelector('form').addEventListener("submit",function(e) {
            
            //Stop it from submiting
            e.preventDefault();
            var formId = this.id;
            console.log(formId);
            var path = this.action;
            var method = this.method.toUpperCase();

            //hide the error message ( if it show due to currently show due to previous error)

            document.querySelector('#'+formId+" .formError").style.display = 'hidden';

            //turn the input into the payload

            var payload = {}; //payload empty object

            var elements = this.elements;
            console.log(`elements[${i}].type`,elements)
            for(var i=0;i<elements.length; i++)
            {
                if(elements[i].type !== 'submit')
                {
                    var valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
                    payload[elements[i].name] = valueOfElement;
                }
            }

            //call the api

            app.client.request(undefined,path,method,undefined,payload,function (statusCode,responsePayload) {
                // display an error on the form if needed

                if(statusCode !== 200)
                {
                    console.log('formprocess')
                    //Try to get the error from the api, or set a default error message
                    var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An Error has occured please try it again';

                    //Set the form error field with the error text
                    document.querySelector('#'+formId+' .formError').innerHTML = error;

                    //Show (unhide) the form error field on the form
                    document.querySelector('#'+formId+" .formError").style.display = 'block';
                }
                else
                {
                    console.log(formId);
                    app.formResponseProcessor(formId,payload,responsePayload);
                }
            });
        });
    }
};


//bind the logout button

app.bindLogoutButton = () => {
    document.getElementById("logoutButton").addEventListener("click",(e) => {
        
        // Stop it from redirecting anywhere
        e.preventDefault();
        console.log('session delete log user out')
        //Log the user out
        app.logUserOut();
    });
};

//log the user out and then redirect again

app.logUserOut = () => {
    //get the current token Id

    
    var tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;


    //Send the current token to the token endpoint to delete it
    var queryStringObject = 
    {
        'id' : tokenId
    }

    app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,(statusCode,responsePayload) => {
        //set the config token as false
        app.setSessionToken(false);
        console.log('session delete log user out')

        //Send the user to the logged out page
        window.location = '/session/deleted';
    });
};

//form response processor

app.formResponseProcessor = function(formId,requestPayload,responsePayload) {
    var functionToCall = false;
    if(formId == 'accountCreate')
    {
      var newPayload =
      {
        'phone' : requestPayload.phone,
        'password' : requestPayload.password
      };

      app.client.request(undefined,'api/tokens','POST',undefined,newPayload,(newStatusCode,newResposePayload) => {
          if(newStatusCode !== 200)
          {
              console.log('statusCode',newStatusCode)
              //set the form error filed with the error text
              document.querySelector('#'+formId+' .formError').innerHTML = 'Sorry, an error is occur';

              //Show or unhide the form error fields in the form
              document.querySelector('#'+formId+' .formError').style.display = 'block';
          }
          else
          {
            console.log('statusCode',newResposePayload)
              //if successfull, set the token and redierct to the user
              app.setSessionToken(newResposePayload);
              window.location = '/checks/all';
          }
      });
    }

    //If login is successful, set the token into the local storage and redirect to the user
    if(formId == 'sessionCreate')
    {
        app.setSessionToken(responsePayload);
        window.location='/checks/all';
    }   
};

app.getSessionToken = () => {
    var tokenString = localStorage.getItem('token');
    if(typeof(tokenString) == 'string')
    {
        try
        {
            var token = JSON.parse(tokenString);
            app.config.sessionToken = token;
            if(typeof(token) == 'object')
            {
                console.log('if tyoefo token',token)
                app.setLoggedInClass(true);
            }
            else
            {
                console.log('else tyoefo token',token)
                app.setLoggedInClass(false);
            }
        }
        catch(e)
        {
            console.log('carch tyoefo token',app.config.sessionToken)
            app.config.sessionToken = false;
            app.setLoggedInClass(false);
        }
    }
};

//Set(or Remove) the loggedIn class from the body

app.setLoggedInClass = function(add) {
    var target = document.querySelector("body");
    if(add)
    {
        target.classList.add('loggedIn');
        console.log(add);
    }
    else
    {
        console.log('setLoggedInClass',add);
        target.classList.remove('loggedIn');
    }
};

//Set the session token in the app.config object as well as localstorage

app.setSessionToken = (token) => {
    app.config.sessionToken = token;
    var tokenString = JSON.stringify(token);
    localStorage.setItem('token',tokenString);
    if(typeof(token) == 'object')
    {
        app.setLoggedInClass(true);
    }
    else
    {
        app.setLoggedInClass(false);
    }
};

//Renew The token

app.renewToken = function(callback) {
    var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;

    if(currentToken)
    {
        //Update the token with new Expiration
        var payload = 
        {
            'id' : currentToken.id,
            'extend' : true
        };

        app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload) {
            if(statusCode == 200)
            {
                // get the new token details
                var queryStringObject = 
                {
                    'id' : currentToken.id
                };

                app.client.request(undefined,'api/tokens','GET', queryStringObject,undefined,function(statusCode,responsePayload) {
                    //Display an error on the form if needed

                    if(statusCode == 200)
                    {
                        app.setSessionToken(responsePayload);
                        callback(false);
                    }
                    else
                    {
                        app.setSessionToken(false);
                        callback(true);
                    }
                });
            }
            else
            {
                app.setSessionToken(false);
                callback(true);
            }
        });
    }
    else
    {
        app.setLoggedInClass(false);
        callback(true);
    }
};

//Loop the renew token offen

app.tokenRenewalLoop = function() {
    setInterval(function(){
        app.renewToken(function(err) {
            if(!err)
            {
                console.log("Token renewed successfully @ " + Date.now());
            }
        });
    },1000*60);
};

app.loadDataOnPage = () => {
    //Get the current page for the body class
    var bodyClasses = document.querySelector("body").classList;
    var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

    //logic for account setting page
    if(primaryClass == 'accountEdit')
    {
        console.log("loaddataonpage");
        app.loadAccountEditPage();
    }
};

app.loadAccountEditPage = () => {
    //Get the phone number from the current token, or the log the user out if none in the list
    
    var phone = typeof(app.config.sessionToken.phone) == 'string' ? app.config.sessionToken.phone : false;
    console.log('account edit',JSON.stringify(app.config.sessionToken.phone));
    if(phone)
    {
        //fetch the user data
        var queryStringObject = 
        {
            'phone' : phone
        };

        //call the api
        console.log("loadaccounteditpage");
        app.client.request(undefined,'api/users','GET',queryStringObject,undefined,(statusCode,responsePayload) => {

            if(statusCode == 200)
            {
                //put the data into the forms as value where needed

                document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
                document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
                document.querySelector("#accountEdit1 .displayPhoneInput").value = responsePayload.phone;

                //Put the hidden phone field into both forms
                var hiddenPhoneInputs = document.querySelectorAll("input.hiddenPhoneNumberInput");
                var i;
                for(i=0;i<hiddenPhoneInputs.length;i++)
                {
                    hiddenPhoneInputs[i].value = responsePayload.phone;
                }
            }
            else
            {
                //If the request come back as something other than 200,log the user out(on the assumption that the api is temperory down or the user token is bad);
                // app.logUserOut();
                console.log('status code',statusCode);
                console.log('responsePayload',responsePayload)
                console.log('here is the issue 1');
            }
        });

        
    }
    else
    {
        // app.logUserOut();
                console.log('here is the issue 2');
    }

};
    
//Init BootStraping
app.init = function() {
    //bind all the form submissions
    app.bindForms();

    //Bind logout logtout button
    app.bindLogoutButton();

    //Get the token from the local storage
    app.getSessionToken();

    //renew Token
    app.tokenRenewalLoop();

    //Load Data on page
    app.loadDataOnPage();
};

//Call the init Processes after the window loads
window.onload = function() {
    app.init();
};