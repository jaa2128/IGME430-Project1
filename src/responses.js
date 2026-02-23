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
    'bookMissingTitle': {
        message: 'Missing title query param',
        id: 'getBookMissingParams'
    },
    'addBookMissingParams': {
        message: 'Author, Country, Language, Pages, Title, Year, and Genres params are all required',
        id: 'addBookMissingParams'
    },
    'rateBookMisingParams': {
        message: 'Title and rating body parameters are both required',
        id: 'rateBookMissingParams'
    },
    'noBookToRate': {
        message: 'No book with title',
        id: 'noBookToRate'
    }
};

// FILTER FUNCTIONS --------------------------------------------------------------------------------
const filterByLanguage = (booksArray, languageQuery) => {
    // Filter based on language
    booksArray = booksArray.filter(book => {
        // generate array of language strings, splitting by commas to handle multiple languages
        // and also trimming entries for clean input comparison
        let languages = book.language.toLowerCase().split(',').map(language => language.trim());

        return languages.includes(languageQuery);
    });

    return booksArray;
}

const filterByGenre = (booksArray, genreQuery) => {
    // Filter based on genre
        booksArray = booksArray.filter(book => {

            // First check if the book has any genres
            if (!book.genres) {
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
            return bookGenres.includes(genreQuery);
        });

        return booksArray;
}

const filterByCountry = (booksArray, countryQuery) => {
     // Filter based on language
        booksArray = booksArray.filter(book => {
            // generate array of language strings, splitting by commas OR slashes (regex command)
            // to handle multiple ways of separating countries
            // and also trimming entries for clean input comparison
            let countries = book.country.toLowerCase().split(/[,/]/).map(country => country.trim());

            return countries.includes(countryQuery);
        });

        return booksArray;
}

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

// GET REQUEST FUNCTIONS ---------------------------------------------------------------------------

// Returns all books object as JSON
const getallBooks = (request, response) => {
    return respondJSON(request, response, 200, books);
}

// Returns Film titles filtered by language and genre
const getBookTitles = (request, response) => {
    // Build the array with all book titles
    let titlesJSON = [];

    // Have a copy of the Books data set to filter through
    let booksCopy = books;

    // If there is a langauge query 
    if (request.query.language) {
        booksCopy = filterByLanguage(booksCopy, request.query.language);
    }

    // If there is a genre query
    if (request.query.genre) {
        booksCopy = filterByGenre(booksCopy, request.query.language);
    }

    // Add each book title to the array
    booksCopy.forEach(book => {
        titlesJSON.push(book.title);
    });

    return respondJSON(request, response, 200, titlesJSON);

}

// Function to get books based off filtered params
const getBooks = (request, response) => {
    // Have a copy of the Books data set to filter through
    let booksCopy = books;

    // If there is a country query 
    if (request.query.country) {
        // Filter based on Country
        booksCopy = filterByCountry(booksCopy, request.query.country);
    }

    // If there is a langauge query 
    if (request.query.language) {
        // Filter based on language
        booksCopy = filterByLanguage(booksCopy, request.query.language);
    }

    // If there is a genre query
    if (request.query.genre) {
        // Filter based on genre
        booksCopy = filterByGenre(booksCopy, request.query.genre);
    }

    return respondJSON(request, response, 200, booksCopy);
}

// Function to find Book based off title
const getBook = (request, response) => {

    // If there is no query, send back 400 bad request
    if (!request.query.title) {
        return respondJSON(request, response, 400, responses['bookMissingTitle'])
    }

    // search array for the book with the respective title
    const book = books.find(book => book.title.toLowerCase() === request.query.title);

    // if it was found return a response
    if (book) {
        return respondJSON(request, response, 200, book);
    }

    return respondJSON(request, response, 404, responses['notFound']);
}

// Function to an unfound page
const notFound = (request, response) => {
    respondJSON(request, response, 404, responses['notFound']);
}

// POST REQUEST FUNCTIONS --------------------------------------------------------------------------

// Function to add and update book dataset
const addBook = (request, response) => {

    // use JS destructing to easily grab request's body
    const { author, country, language, pages, title, year, genres } = request.body;

    // make sure that all fields exist otherwise send proper response
    if (!author || !country || !language || !pages || !title || !year || !genres) {
        return respondJSON(request, response, 400, responses['bookMissingTitle']);
    }

    // check if the book exists by the title, if it doesn't, create A new Book
    // search array for the book with the respective title
    const book = books.find(book => book.title.toLowerCase() === title.toLowerCase());

    // If it exists update all its fields then respond with 204
    if (book) {
        book.author = author;
        book.country = country;
        book.language = language;
        book.pages = pages;
        book.year = year;
        book.genres = genres;
        // If the book existed and was updated, send 204 response with no body
        return respondJSON(request, response, 204, {});
    }

    // Otherwise build the new book and add it to the dataset
    const newBook = {
        "author": author,
        "country": country,
        "language": language,
        "pages": pages,
        "title": title,
        "year": year,
        "genres": genres,
    }

    books.push(newBook);

    // If a new book was created send 201 response
    return respondJSON(request, response, 201, newBook);
}

// Function to rate an existing book in the dataset
const rateBook = (request, response) => {

    // get the title of the book based off the request body
    const { title, rating } = request.body;

    // if there is no rating send 400
    if (!rating || !title) {
        return respondJSON(request, response, 400, responses['rateBookMisingParams']);
    }

    // find the book based off the title
    const book = books.find(book => book.title.toLowerCase() === title.toLowerCase());

    // if it doesn't exist, send 400
    if (!book) {
        return respondJSON(request, response, 400, responses['noBookToRate']);
    }



    // if there's both, simply update the book with the rating
    book.rating = rating;

    return respondJSON(request, response, 200, book);

}

module.exports = {
    getBookTitles,
    getBooks,
    getBook,
    rateBook,
    getallBooks,
    notFound,
    addBook
}
