const puppeteer = require('puppeteer');

const headless = process.env.headless !== 'no';
// puppeteer.defaultArgs({
//   args: [
//     '--no-sandbox',
//     '--disable-setuid-sandbox',
//     '--disable-dev-shm-usage',
//   ],
//   headless,
// });

console.log('headless = ', headless);

// ***** DOM Selectors *****
/* eslint-disable */
const kindlePageSelector = '#result_0 > div > div > div > div.a-fixed-left-grid-col.a-col-right > div.a-row.a-spacing-small > div:nth-child(1) > a';
const titleSelector = '#ebooksProductTitle';
const priceSelector = '#buybox > div > table > tbody > tr.kindle-price > td.a-color-price.a-size-medium.a-align-bottom';
const priceSelectorAlt = '#mediaNoAccordion > div.a-row > div.a-column.a-span4.a-text-right.a-span-last > span.a-size-medium.a-color-price.header-price';
/* eslint-enable */

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
    await page.setViewport({ width: 1280, height: 800 });
    // prevent browser from loading images
    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    //   if (req.resourceType() === 'image') {
    //     req.abort();
    //   } else {
    //     req.continue();
    //   }
    // });
    // Prevent page from loading unwanted resources
    await page.setRequestInterception(true);
    const blockResources = ['image', 'stylesheet', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
    page.on('request', (req) => {
      if (blockResources.includes(req.resourceType)) {
        console.log('blocking resource!');
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

async function getUrlByTitle(title, browser) {
  let url;
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  // prevent browser from loading images
  // await page.setRequestInterception(true);
  // page.on('request', (req) => {
  //   if (req.resourceType() === 'image') {
  //     req.abort();
  //   } else {
  //     req.continue();
  //   }
  // });
  // Prevent page from loading unwanted resources
  await page.setRequestInterception(true);
  const blockResources = ['image', 'stylesheet', 'media', 'font', 'texttrack', 'object', 'beacon', 'csp_report', 'imageset'];
  page.on('request', (req) => {
    if (blockResources.includes(req.resourceType)) {
      console.log('blocking resource!');
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
    console.log(`Searched for '${title} kindle' in search box`);
    await page.waitForSelector('#resultsCol');
    console.log('Got results column...');
    url = await page.evaluate(kps => document.querySelector(kps).href, kindlePageSelector)
      .then(() => page.close());
    // console.log('page evlauate has returned with the url: ', url);
    // console.log('now the page just closed');
    return url;
  } catch (err) {
    console.error(`--> CANT GET URL FOR TITLE ${title}\n`, err);
  }
  return null;
}

async function getAllUrlsFromTitles(titles) {
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    headless,
    // defaultViewport: { width: 1280, height: 800 },
  });
  const chunkedTitles = chunkArray(titles, 5);
  let round = 1;
  const urls = await (async function () {
    const results = [];
    for (const chunk of chunkedTitles) {
      try {
        const urlsChunk = await Promise.all(chunk.map(title => getUrlByTitle(title, browser)));
        results.push(...urlsChunk);
        console.log(`Delivered round ${round} of titles: ${chunk}`);
      } catch (err) {
        console.error(`--> Failed to deliver round ${round} of titles\n`, err);
      }
      round++;
    }
    return results;
  }());
  await browser.close();
  return urls.filter(url => url);
}

async function getAllPricesFromUrls(urls) {
  console.log(`Fetching prices for ${urls.length} books`);
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
    headless,
    // defaultViewport: { width: 1280, height: 800 },
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
  getAllUrlsFromTitles,
};
