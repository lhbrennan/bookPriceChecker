const puppeteer = require('puppeteer');

const titleSelector = '#ebooksProductTitle';
const priceSelector = '#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom';
const priceSelectorAlt = '#mediaNoAccordion > div.a-row > div.a-column.a-span4.a-text-right.a-span-last > span.a-size-medium.a-color-price.header-price';

const getPrice = async function (url, browser) {
  let data;

  try {
    const page = await browser.newPage();

    // prevents images from loading to speed up scraping
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.resourceType() === 'image') {
        req.abort();
      } else {
        req.continue();
      }
    });

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

async function getAllPrices(urls) {
  const browser = await puppeteer.launch();
  const prices = await Promise.all(urls.map(url => getPrice(url, browser)));
  await browser.close();
  return prices.filter(price => price);
}
// const testUrl = 'https://www.amazon.com/dp/B01HMXV0UQ/ref=dp-kindle-redirect?_encoding=UTF8&btkr=1';
// getAllPrices([testUrl]);
module.exports = getAllPrices;
