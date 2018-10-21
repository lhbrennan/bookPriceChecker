const puppeteer = require('puppeteer');

// const titleSelector = '#ebooksProductTitle';
// const priceSelector = '#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom';

const getPrice = async function (url, browser) {
  let data;

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitFor: 'domcontentloaded' });
    data = await page.evaluate(() => {
      const title = document.querySelector('#ebooksProductTitle')
        .textContent.trim();
      const price = Number(document.querySelector('#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom')
        .textContent.trim().split(' ')[0].slice(1));
      console.log(title, price);
      return { title, price };
    });
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
