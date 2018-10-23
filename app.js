const cTable = require('console.table'); // eslint-disable-line
const { getTitlesNeedingUrls, getKindleUrls } = require('./getFromAirtable.js');
const { getAllPricesFromUrls, getAllUrlsFromTitles } = require('./scrapeAmazon.js');
const mailer = require('./mailer');

(async () => {
  const startTime = Date.now();
  const titlesNeedingUrls = await getTitlesNeedingUrls();
  const scrapedKindleUrls = await getAllUrlsFromTitles(titlesNeedingUrls.slice(0, 20)); // Remove slice for production
  // console.log(scrapedKindleUrls);
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
