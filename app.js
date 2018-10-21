const cTable = require('console.table'); // eslint-disable-line
const getKindleUrls = require('./getKindleUrls.js');
const getAllPrices = require('./getAllPrices.js');
const mailer = require('./mailer');

(async () => {
  const startTime = Date.now();
  const kindleUrls = await getKindleUrls();
  const books = await getAllPrices(kindleUrls);
  console.table(books.map(book => ({ title: book.title, price: book.price })));
  const booksOnSale = books.filter(book => book.price < 3);
  if (booksOnSale[0]) {
    mailer(booksOnSale);
  }
  console.log('Runtime in seconds: ', (Date.now() - startTime) / 1000);
})();
