const puppeteer = require('puppeteer');

const headless = process.env.headless !== 'no';
const slowMo = process.env.slowMo || 0;

console.log('headless = ', headless);

/* eslint-disable */
const priceSelector = '#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom';
const priceSelectorAlt = '#mediaNoAccordion > div.a-row > div.a-column.a-span4.a-text-right.a-span-last > span.a-size-medium.a-color-price.header-price';
/* eslint-enable */

const getPriceFromLink = async function (link, browser) {
  let price;
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(link, { waitFor: 'domcontentloaded' });
    price = await page.evaluate((ps, psa) => {
      const priceElement = document.querySelector(ps) || document.querySelector(psa);
      return Number(priceElement.textContent.trim().split(' ')[0].slice(1));
    }, priceSelector, priceSelectorAlt);
  } catch (error) {
    console.log('PROBLEM FETCHING PRICE FOR', link);
  }
  page.close();
  return price || null;
};

async function getAllPricesFromLinks(books) {
  const booksWithPrices = [...books];
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
    for (const book of booksWithPrices) {
      try {
        const price = await getPriceFromLink(book.link, browser);
        console.log(`Found price for ${book.title}`);
        book.price = price;
      } catch (err) {
        console.error(`**********\nFailed to find price for ${book.title}\n**********`, err);
      }
    }
  }());
  await browser.close();
  return booksWithPrices;
}

module.exports = getAllPricesFromLinks;
