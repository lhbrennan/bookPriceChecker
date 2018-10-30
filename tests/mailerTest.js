const mailer = require('../mailer');

const testBooks = [
  {
    title: 'testTitle',
    link: 'example.com',
    subtitle: 'testSubtitle',
    authors: ['Author McAuthorson'],
    id: 'ajsaowl2kj20skdo',
    price: 2.99,
  },
  {
    title: 'I\'m just a title',
    link: 'wherefromhere.org',
    subtitle: '',
    authors: null,
    id: 'ajsaowl2kj20skdo',
    price: 2.99,
  },
];

mailer(testBooks);
