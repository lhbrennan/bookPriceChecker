const puppeteer = require('puppeteer');

// ***** DOM Selectors *****
/* eslint-disable */
const kindlePageSelector = '#result_0 > div > div > div > div.a-fixed-left-grid-col.a-col-right > div.a-row.a-spacing-small > div:nth-child(1) > a';
const titleSelector = '#ebooksProductTitle';
const priceSelector = '#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom';
const priceSelectorAlt = '#mediaNoAccordion > div.a-row > div.a-column.a-span4.a-text-right.a-span-last > span.a-size-medium.a-color-price.header-price';
/* eslint-enable */

// ***** Launch configs *****
const chromeConfig = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
];
const headless = process.env.headless !== 'no';
console.log('headless = ', headless);

// ***** Main functions *****
const chunkArray = (myArray, chunkSize) => {
  const results = [];
  while (myArray.length) {
    results.push(myArray.splice(0, chunkSize));
  }
  return results;
};

const getPriceByUrl = async function (url, browser) {
  let data;
  try {
    const page = await browser.newPage();
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
    await page.close();
  } catch (error) {
    console.log('PROBLEM FETCHING PRICE FOR', url);
  }
  if (data) {
    data.url = url;
  }
  return data;
};

async function getUrlByTitle(title, browser) {
  let url;
  const page = await browser.newPage();
  // prevent browser from loading images
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.resourceType() === 'image') {
      req.abort();
    } else {
      req.continue();
    }
  });
  // search title to find URL
  try {
    await page.goto('https://www.amazon.com', { waitUntil: 'networkidle2', timeout: 180000 });
    console.log('Opened Amazon, looking for search box');
    await page.type('#twotabsearchtextbox', `${title} kindle`);
    await page.click('input.nav-input');
    console.log(`Searched for '${title} kindle' in search box`);
    await page.waitForSelector('#resultsCol');
    console.log('Got results column...');
    url = page.evaluate(kps => document.querySelector(kps).href, kindlePageSelector);
  } catch (err) {
    console.error(`CANT GET URL FOR TITLE ${title}`, err);
  }
  // await page.close();
  return url;
}

async function getAllUrlsFromTitles(titles) {
  const browser = await puppeteer.launch({ headless, args: chromeConfig });
  const chunkedTitles = chunkArray(titles, 3);
  let round = 1;
  const urls = await (async function () {
    const results = [];
    for (const chunk of chunkedTitles) {
      try {
        const urlsChunk = await Promise.all(chunk.map(title => getUrlByTitle(title, browser)));
        results.push(...urlsChunk);
        console.log(`Delivered round ${round} of titles: ${chunk}`);
      } catch (err) {
        console.error(`Failed to deliver ${round} of titles`, err);
      }
      round++;
    }
    return results;
  }());
  await browser.close();
  return urls.filter(url => url);
}

async function getAllPricesFromUrls(urls) {
  const browser = await puppeteer.launch({ headless, args: chromeConfig });
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
  getAllUrlsFromTitles,
};
