const Airtable = require('airtable');

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: process.env.AIRTABLE_API_KEY,
});

const base = Airtable.base('app9zZLSur5YlFUMZ');
const viewToSearch = 'Books to Buy';
const fieldsToFetch = ['Title', 'Subtitle', 'Authors', 'Link'];

const getBooks = async () => {
  const books = [];
  return base('Books').select({
    view: viewToSearch,
    fields: fieldsToFetch,
  }).eachPage((records, fetchNextPage) => {
    records.forEach((record) => {
      const book = {
        id: record.id,
        title: record.get('Title'),
        subtitle: record.get('Subtitle'),
        authors: record.get('Authors'),
        link: record.get('Link'),
      };
      books.push(book);
      fetchNextPage();
    });
  }).then(() => {
    const filter = title => title;
    return books.filter(filter);
  });
};

module.exports = getBooks;
