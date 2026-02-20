// http and handlers
const http = require('http');
const htmlHandler = require('./htmlResponses.js');
const respondHandler = require('./responses.js');

// querystring module for parsing query strings from url
const query = require('querystring');

// Port
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// url struct to easily handle responses
const urlStruct ={
    '/': htmlHandler.getIndex,
    '/style.css': htmlHandler.getCss,
    '/getAllBooks': respondHandler.getallBooks,
    '/getBookTitles': respondHandler.getBookTitles,
    '/notReal': respondHandler.notFound,
    '/addBook': respondHandler.addBook,
    notFound: respondHandler.notFound
}

// function to parse and rebuild the request body of a post request
// handler method is what we call after reassembling the request
const parseBody = (request, response, handler) => {
    
    //body array to store pieces of the request
    const body = [];

    // event handler for if there is an error, if there is
    // print to console and send back a 400 error
    request.on('error', (err) => {
        console.dir(err);
        response.statusCode = 400;
        response.end();
    });

    // event handler for when we receive a chunk of data
    request.on('data', (chunk) => {
        body.push(chunk);
    });

    // event handler for when the request is finished sending 
    // and all data is received
    request.on('end', () => {

        // concatonates the body into a string
        const bodyString = Buffer.concat(body).toString();

        // grab content type the request is looking for
        const type = request.headers['content-type'];

        // Then depending on the type set the request body to 
        // the respective parsed string
        // NOTE: for http-api-assignment-ii this is unecessary
        // as all data is JSON but for Project 1 it is important
        // as we need to support this x-www-form-urlencoded post requests
        // thus why this particular implementation as it will be used as a template
        // for Project 1
        if(type === 'application/x-www-form-urlencoded'){
            request.body = query.parse(bodyString);
        } else if (type === 'application/json'){
            request.body = JSON.parse(bodyString);
        } else {
            response.writeHead(400, {'Content-Type': 'application/json'});
            response.write(JSON.stringify({error: 'invalid data format'}));
            return response.end();
        } 

        // lastly once we have the body params we can call the respective handler function
        handler(request, response);
    })
}

const onRequest = (request, response) => {
    const protocol = request.connection.encrypted ? 'https' : 'http';
    const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

    const handler = urlStruct[parsedUrl.pathname];

    // first check if this is a POST request AND if there's a handler
    // method for the url, if it is, parse the body 
    // and use the respective handler for the url
    if(request.method === 'POST' && handler){
        parseBody(request, response, handler);
    }

    // if it's a different request like a GET or HEAD
    // simply call the handler method
    else if(handler){
        handler(request, response);
    } 

    // lastly if there is no handler for the url
    // use the Not Found handler method
    else {
        urlStruct.notFound(request, response);
    }
};

// Create Server 
http.createServer(onRequest).listen(port, () => {
    console.log(`Listening on 127.0.0.1:${port}`);
});