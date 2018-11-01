const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground',
);

oauth2Client.setCredentials({
  refresh_token: 'process.env.REFRESH_TOKEN',
});

// TODO `refreshAccessToken` is deprecated. Use `getRequestHeaders` instead.
const accessToken = oauth2Client.refreshAccessToken()
  .then(res => res.credentials.access_token);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAUTH2',
    user: 'lhbext@gmail.com',
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken,
  },
});

module.exports = (books) => {
  const subject = `There are ${books.length} kindle books on sale today 🔥`;
  const html = books.map(book => (
    `<p><a href="${book.link}">${book.title}</h>: $${book.price}</p>`
  )).join('');

  const mailOptions = {
    from: 'lhbext@gmail.com',
    to: 'lhbrennan@gmail.com',
    generateTextFromHTML: true,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    console.log(err || info);
    transporter.close();
  });
};
