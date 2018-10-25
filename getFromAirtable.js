const Airtable = require('airtable');

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base('app9zZLSur5YlFUMZ');

const getTitlesNeedingUrls = async () => {
  const titles = [];

  return base('Books').select({
    fields: ['Title', 'Link'],
    view: 'Books to Buy',
  }).eachPage((records, fetchNextPage) => {
    records.forEach((record) => {
      const url = record.get('Link');
      const title = record.get('Title');
      if (!url) { titles.push(title); }
      fetchNextPage();
    });
  }).then(() => {
    const filter = title => title;
    return titles.filter(filter);
  });
};

const getKindleUrls = async () => {
  const urls = [];

  return base('Books').select({
    fields: ['Link'],
    view: 'Books to Buy',
  }).eachPage((records, fetchNextPage) => {
    records.forEach((record) => {
      const url = record.get('Link');
      if (url) { urls.push(url); }
      fetchNextPage();
    });
  }).then(() => {
    const filter = link => link && link.includes('amazon.com/');
    return urls.filter(filter);
  });
};

module.exports = { getKindleUrls, getTitlesNeedingUrls };
