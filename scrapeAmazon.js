const puppeteer = require('puppeteer');
const { chunkArray } = require('./helpers.js');

const headless = process.env.headless !== 'no';
console.log('headless = ', headless);

/* eslint-disable */
const titleSelector = '#ebooksProductTitle';
const priceSelector = '#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom';
const priceSelectorAlt = '#mediaNoAccordion > div.a-row > div.a-column.a-span4.a-text-right.a-span-last > span.a-size-medium.a-color-price.header-price';
/* eslint-enable */

const getPriceByUrl = async function (url, browser) {
  let data;
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    // prevent browser from loading images
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });
    // go to URL to get price
    await page.goto(url, { waitFor: 'domcontentloaded' });
    data = await page.evaluate((ts, ps, psa) => {
      const title = document.querySelector(ts).textContent.trim();
      const priceElement = document.querySelector(ps) || document.querySelector(psa);
      const price = Number(priceElement.textContent.trim().split(' ')[0].slice(1));
      return Promise.resolve({ title, price });
    }, titleSelector, priceSelector, priceSelectorAlt);
    page.close();
  } catch (error) {
    console.log('PROBLEM FETCHING PRICE FOR', url);
  }
  if (data) {
    data.url = url;
  }
  return data;
};

async function getAllPricesFromUrls(urls) {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    headless,
    defaultViewport: { width: 1280, height: 800 },
  });
  const chunkedUrls = chunkArray(urls, 5);
  const prices = await (async function () {
    const results = [];
    for (const chunk of chunkedUrls) {
      try {
        const pricesChunk = await Promise.all(chunk.map(url => getPriceByUrl(url, browser)));
        results.push(...pricesChunk);
      } catch (err) {
        console.error('URLs --> Prices chunk failed', err);
      }
    }
    return results;
  }());
  await browser.close();
  return prices.filter(price => price);
}

module.exports = {
  getAllPricesFromUrls,
};
