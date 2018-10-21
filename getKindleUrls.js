const Airtable = require('airtable');
const { AIRTABLE_API_KEY } = require('./KEYS');

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: AIRTABLE_API_KEY,
});

const base = Airtable.base('app9zZLSur5YlFUMZ');

const getKindleUrls = async () => {
  const links = [];

  return base('Books').select({
    fields: ['Link'],
    view: 'Books to Buy',
  }).eachPage((records, fetchNextPage) => {
    records.forEach((record) => {
      const link = record.get('Link');
      if (link) { links.push(link); }
      fetchNextPage();
    });
  }).then(() => {
    const filter = link => link && link.includes('amazon.com/');
    return links.filter(filter);
  });
};

module.exports = getKindleUrls;
