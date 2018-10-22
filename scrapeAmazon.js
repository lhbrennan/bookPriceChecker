const puppeteer = require('puppeteer');

/* eslint-disable */
const kindlePageSelector = '#result_0 > div > div > div > div.a-fixed-left-grid-col.a-col-right > div.a-row.a-spacing-small > div:nth-child(1) > a';
const titleSelector = '#ebooksProductTitle';
const priceSelector = '#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom';
const priceSelectorAlt = '#mediaNoAccordion > div.a-row > div.a-column.a-span4.a-text-right.a-span-last > span.a-size-medium.a-color-price.header-price';
/* eslint-enable */

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
    await page.type('#twotabsearchtextbox', `${title} kindle`);
    await page.click('input.nav-input');
    await page.waitForSelector('#resultsCol');
    url = page.evaluate(kps => document.querySelector(kps).href, kindlePageSelector);
  } catch (error) {
    console.error('CANT GET URL FOR TITLE', title);
    console.log(error);
  }
  return url;
}

async function getAllUrlsFromTitles(titles) {
  const browser = await puppeteer.launch();
  const chunkedTitles = chunkArray(titles, 5);
  console.log(chunkedTitles);
  const urls = await (async function () {
    const urls = [];
    console.log('got here');
    for (const titles of chunkedTitles) {
      console.log(titles);
      const urlsChunk = await Promise.all(titles.map(title => getUrlByTitle(title, browser)));
      urls.push(...urlsChunk);
    }
    return urls;
  })();
  await browser.close();
  return urls.filter(url => url);
}

async function getAllPricesFromUrls(urls) {
  const browser = await puppeteer.launch();
  const prices = await Promise.all(urls.map(url => getPriceByUrl(url, browser)));
  await browser.close();
  return prices.filter(price => price);
}

module.exports = {
  getAllPricesFromUrls,
  getAllUrlsFromTitles,
};