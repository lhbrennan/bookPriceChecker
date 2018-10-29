const cTable = require('console.table'); // eslint-disable-line
const { getBooks, addLinks } = require('./airtable.js');
const { getAllPricesFromUrls } = require('./getPricesFromAmazon.js');
const addLinksFromAmazon = require('./addLinksFromAmazon.js');
const mailer = require('./mailer');

(async () => {
  const startTime = Date.now();
  let books = await getBooks();

  const booksWithoutLinks = books.filter(book => !book.link);
  if (booksWithoutLinks.length > 0) {
    const booksWithNewLinks = await addLinksFromAmazon(booksWithoutLinks);
    addLinks(booksWithNewLinks);
    books = books.filter(book => book.link);
    books = [...books, booksWithNewLinks];
  }

  const booksWithPrices = await getAllPricesFromUrls(books);
  console.table(booksWithPrices.map(book => ({ title: book.title, price: book.price })));
  const booksOnSale = books.filter(book => book.price < 3);
  if (booksOnSale[0]) {
    mailer(booksOnSale);
  }
  console.log('Runtime in seconds: ', (Date.now() - startTime) / 1000);
})();
