const puppeteer = require('puppeteer');

const headless = process.env.headless !== 'no';
const slowMo = process.env.slowMo || 0;

console.log('headless = ', headless);

/* eslint-disable */
const kindlePageSelector = '#result_0 > div > div > div > div.a-fixed-left-grid-col.a-col-right > div.a-row.a-spacing-small > div:nth-child(1) > a';
/* eslint-enable */

async function getLinkByTitle(book, browser) {
  let url;
  const { title, subtitle, authors } = book;
  const searchStr = `${title} ${subtitle || authors[0] || ''} kindle`;
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto('https://www.amazon.com', { waitUntil: 'networkidle2', timeout: 180000 });
    await page.type('#twotabsearchtextbox', searchStr);
    await page.click('input.nav-input');
    console.log(`Searched for "${searchStr}" in search box`);
    await page.waitForSelector('#resultsCol');
    console.log('Got results column...');
    url = await page.evaluate(kps => document.querySelector(kps).href, kindlePageSelector);
    page.close();
  } catch (err) {
    console.error(`\n**********CANT FIND URL FOR TITLE ${title}\n`, err);
  }
  return url || null;
}

async function addLinksToBooks(books) {
  const booksWithLinks = [...books];
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    headless,
    slowMo,
    defaultViewport: { width: 1280, height: 800 },
  });

  await (async function () {
    for (const book of booksWithLinks) {
      try {
        const link = await getLinkByTitle(book, browser);
        console.log(`Found kindle link for ${book.title}`);
        book.link = link;
      } catch (err) {
        console.error(`**********\nFailed to find kindle link for ${book.title}\n**********`, err);
      }
    }
  }());
  await browser.close();
  return booksWithLinks;
}

module.exports = addLinksToBooks;
