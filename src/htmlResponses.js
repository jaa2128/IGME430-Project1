const fs = require('fs'); // pull in the file system module

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const documentation = fs.readFileSync(`${__dirname}/../client/documentation.html`);
const css = fs.readFileSync(`${__dirname}/../client/style.css`);
const bookCss = fs.readFileSync(`${__dirname}/../client/bookshelf.css`);
const bookJs = fs.readFileSync(`${__dirname}/../client/bookshelf.js`);
const cssUtils = fs.readFileSync(`${__dirname}/../client/cssUtils.js`);

const respond = (request, response, status, content, type) => {
  response.writeHead(status, { 
    'Content-Type': type, 
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });
  response.write(content);
  response.end();
};

const getIndex = (request, response) => {
    respond(request, response, 200, index, 'text/html');
};

const getDocumentation = (request, response) => {
    respond(request, response, 200, documentation, 'text/html');
};

const getCss = (request, response) => {
    respond(request, response, 200, css, 'text/css');
}

const getBookCss = (request, response) => {
    respond(request, response, 200, bookCss, 'text/css');
}

const getBookJs = (request, response) => {
  respond(request, response, 200, bookJs, 'text/javascript');
}

const getCssUtils = (request, response) => {
  respond(request, response, 200, cssUtils, 'text/javascript');
}

module.exports = {
    getIndex,
    getCss,
    getBookCss,
    getBookJs,
    getCssUtils,
    getDocumentation
}