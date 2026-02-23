const fs = require('fs');
const rawData = fs.readFileSync(`${__dirname}/../src/books.json`);
const books = JSON.parse(rawData);

// error messages
const responses = {
    'notFound': {
        message: 'The book you are looking for was not found',
        id: 'notFound'
    },
    'created': {
        message: 'Created Successfully'
    },
    'badRequest': {
        message: 'Missing title query param',
        id: 'getBookMissingParams'
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
    if (request.method !== 'HEAD') {
        response.write(content);
    }

    response.end();
}

// return all books object as JSON
const getallBooks = (request, response) => {
    return respondJSON(request, response, 200, books);
}

// Return Film titles filtered by language and genre
const getBookTitles = (request, response) => {
    // Build the array with all book titles
    let titlesJSON = [];

    // Have a copy of the Books data set to filter through
    let booksCopy = books;

    // If there is a langauge query 
    if (request.query.language) {

        // Filter based on language
        booksCopy = booksCopy.filter(book => {
            // generate array of language strings, splitting by commas to handle multiple languages
            // and also trimming entries for clean input comparison
            let languages = book.language.toLowerCase().split(',').map(language => language.trim());

            return languages.includes(request.query.language);
        });
    }

    // If there is a genre query
    if (request.query.genre) {

        // Filter based on genre
        booksCopy = booksCopy.filter(book => {

            // First check if the book has any genres
            if(!book.genres){
                return;
            }

            // if there is make copy of book genres array
            let bookGenres = book.genres;

            // Generate array of strings that correspond to genres in a book
            // Split by spaces to allow Partial Responses i.e. "Magical Realism" and "Realism"
            // Then .toLowerCase to have a clean input comparison 
            // Then .flat() to add elements in any sub arrays in the split to the full array
            bookGenres = bookGenres.map(genre => genre.toLowerCase().split(' ')).flat(); 

            // If the array of strings has an element that matches the query return the book
            return bookGenres.includes(request.query.genre);
        });
    }

    // Add each book title to the array
    booksCopy.forEach(book => {
        titlesJSON.push(book.title);
    });

    return respondJSON(request, response, 200, titlesJSON);

}

const getBooks = (request, response) => {
    // Have a copy of the Books data set to filter through
    let booksCopy = books;

    // If there is a country query 
    if (request.query.country) {

        // Filter based on language
        booksCopy = booksCopy.filter(book => {
            // generate array of language strings, splitting by commas OR slashes (regex command)
            // to handle multiple ways of separating countries
            // and also trimming entries for clean input comparison
            let countries = book.country.toLowerCase().split(/[,/]/).map(country => country.trim());

            return countries.includes(request.query.country);
        });
    }

    // If there is a langauge query 
    if (request.query.language) {

        // Filter based on language
        booksCopy = booksCopy.filter(book => {
            // generate array of language strings, splitting by commas to handle multiple languages
            // and also trimming entries for clean input comparison
            let languages = book.language.toLowerCase().split(',').map(language => language.trim());

            return languages.includes(request.query.language);
        });
    }

    // If there is a genre query
    if (request.query.genre) {

        // Filter based on genre
        booksCopy = booksCopy.filter(book => {

            // First check if the book has any genres
            if(!book.genres){
                return;
            }

            // if there is make copy of book genres array
            let bookGenres = book.genres;

            // Generate array of strings that correspond to genres in a book
            // Split by spaces to allow Partial Responses i.e. "Magical Realism" and "Realism"
            // Then .toLowerCase to have a clean input comparison 
            // Then .flat() to add elements in any sub arrays in the split to the full array
            bookGenres = bookGenres.map(genre => genre.toLowerCase().split(' ')).flat(); 

            // If the array of strings has an element that matches the query return the book
            return bookGenres.includes(request.query.genre);
        });
    }

    return respondJSON(request, response, 200, booksCopy);
}

const getBook = (request, response) => {
    // TODO: send back book based on title, 400 status if no title is provided

    // If there is no query, send back 400 bad request
    if(!request.query.title){
        return respondJSON(request, response, 400, responses['badRequest'])
    }

    // search array for the book with the respective title
    const book = books.find(book => book.title.toLowerCase() === request.query.title);

    // if it was found return a response
    if(book){
        return respondJSON(request, response, 200, book);
    }
    
    return respondJSON(request, response, 404, responses['notFound']);
}

const notFound = (request, response) => {
    respondJSON(request, response, 404, responses['notFound']);
}

// TODO: change following function to add Books to the Books data set
// TODO: must include following params: author, country, language, pages, title, year, and genres
const addBook = (request, response) => {
    let isNewUserCreated = false;

    // use JS destructing to easily grab request's body
    const { name, age } = request.body;

    // make sure that both fields exist otherwise send proper response
    if (!name || !age) {
        return respondJSON(request, response, 400, responses['badRequest']);
    }

    // check if the user exists, if it doesn't, create new user
    if (!books[name]) {

        books[name] = {
            name: name,
        };

        // new user is created
        isNewUserCreated = true;
    }

    // add or update age for this user name
    books[name].age = age;

    // If a new user was created send 201 response
    if (isNewUserCreated) {
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
    getBooks,
    getBook,
    //rateBook,
    getallBooks,
    notFound,
    addBook
}
