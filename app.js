const cTable = require('console.table'); // eslint-disable-line
const getBooks = require('./getBooksFromAirtable.js');
const { getAllPricesFromUrls, findAllLinks } = require('./scrapeAmazon.js');
const mailer = require('./mailer');

(async () => {
  const startTime = Date.now();
  const books = getBooks();
  const booksWithoutLinks = books.filter(book => !book.link);
  // if (booksWithoutLinks.length > 0) {
  //   const newLinks = findAllLinks(booksWithoutLinks);

  // }
  const scrapedKindleUrls = await getAllUrlsFromTitles(titlesNeedingUrls);
  const storedKindleUrls = await getKindleUrls();
  const allKindleUrls = [...storedKindleUrls, ...scrapedKindleUrls];
  const books = await getAllPricesFromUrls(allKindleUrls);
  console.table(books.map(book => ({ title: book.title, price: book.price })));
  const booksOnSale = books.filter(book => book.price < 3);
  if (booksOnSale[0]) {
    mailer(booksOnSale);
  }
  console.log('Runtime in seconds: ', (Date.now() - startTime) / 1000);
})();
