const fs = require('fs');
const rawData = fs.readFileSync(`${__dirname}/../src/books.json`);
const books = JSON.parse(rawData);

// error messages
const responses = {
    'notFound' : {
        message: 'The page you are looking for was not found',
        id: 'notFound'
    },
    'created' : {
        message: 'Created Successfully'
    },
    'badRequest': {
        message: 'Name and age are both required.',
        id: 'addUserMissingParams'
    }
};

// function to respond with a JSON object
const respondJSON = (request, response, status, object) => {
    
    const content = JSON.stringify(object);

    // Set Headers including the type and length
    response.writeHead(status, {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content, 'utf8'),
    });

    // only write content if it is not a head request
    if(request.method !== 'HEAD'){
        response.write(content);
    }
    
    response.end();
}

// return all books object as JSON
const getallBooks = (request, response) => {
    respondJSON(request, response, 200, books);
}

const getBookTitles = (request, response) => {
    // Build the array with all book titles
    let titlesJSON = [];

    // If there is no query
    if(!request.query){

        // Add each book title to the array
        books.forEach(book => {
            titlesJSON.push(book.title);
        });
    }
    
    // TODO: be able to filter based of language or genre
    //

    // return this response:
    respondJSON(request, response, 200, titlesJSON);


    
}

// const getBooks = (request, response) => {
//     // TODO: send back JSON response with all books if there are no params

//     // TODO: send back JSON response with all books filtered by country, language, and genre
// }

// const getBook = (request, response) => {
//     // TODO: send back book based on title, 400 status if no title is provided
// }

const notFound = (request, response) => {
    respondJSON(request, response, 404, responses['notFound']);
}

// TODO: change following function to add Books to the Books data set
// TODO: must include following params: author, country, language, pages, title, year, and genres
const addBook = (request, response) => {
    let isNewUserCreated = false;

    // use JS destructing to easily grab request's body
    const {name, age} = request.body;

    // make sure that both fields exist otherwise send proper response
    if(!name || !age){
        return respondJSON(request, response, 400, responses['badRequest']);
    }

    // check if the user exists, if it doesn't, create new user
    if(!books[name]){

        books[name] = {
            name: name,
        };

        // new user is created
        isNewUserCreated = true;
    }

    // add or update age for this user name
    books[name].age = age;

    // If a new user was created send 201 response
    if(isNewUserCreated){
        return respondJSON(request, response, 201, responses['created']);
    }

    // If the user existed and was updated, send 204 response with no body
    return respondJSON(request, response, 204, {});
}


// const rateBook = (request, response) => {
//     // TODO: update an existing book to have a rating based off request
// }

module.exports = {
    getBookTitles,
   // getBooks,
    //getBook,
    //rateBook,
    getallBooks,
    notFound,
    addBook
}
