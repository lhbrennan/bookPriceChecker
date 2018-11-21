const nodemailer = require('nodemailer');
const { google: { auth: { OAuth2 } } } = require('googleapis');

module.exports = async (books) => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
  );

  oauth2Client.setCredentials({
    refresh_token: 'process.env.REFRESH_TOKEN',
  });

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAUTH2',
        user: 'lhbext@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

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
  } catch (err) {
    console.log(`*****\nProblem with the mailer: ${err.message}\n*****`);
  }
};
