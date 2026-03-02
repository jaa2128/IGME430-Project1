// NOTE: Slightly modified from original source code to work for my particular application of
// the source code
import { getRootCssStyles } from './cssUtils.js';

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export const styleBookshelf = (bookshelf) => {

  let spines = Object.values(bookshelf.getElementsByClassName("spine"));
  let covers = Object.values(bookshelf.getElementsByClassName("cover"));
  let tops = Object.values(bookshelf.getElementsByClassName("top"));

  let availablePatterns = getRootCssStyles();

  let availableColors = [
    "maroon",
    "darkgreen",
    "darkolivegreen",
    "brown",
    "saddlebrown",
    "sienna",
    "midnightblue",
  ];

  // assign a random height, pattern and colour to each book
  spines.map(function (s, i) {
    let randomHeight = getRandomInt(220, 270);
    s.style.height = `${randomHeight}px`;
    s.style.top = `${280 - randomHeight}px`;

    let randomPattern = randomChoice(availablePatterns);
    s.style.backgroundImage = `var(${randomPattern})`;

    let randomColor = randomChoice(availableColors);
    s.style.backgroundColor = randomColor;

    covers[i].style.height = `${randomHeight}px`;
    covers[i].style.top = `${280 - randomHeight}px`;

    tops[i].style.top = `${280 - randomHeight}px`;
  });
}


