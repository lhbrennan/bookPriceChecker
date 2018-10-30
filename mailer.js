const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lhbext@gmail.com',
    pass: process.env.gmailPw,
  },
});

module.exports = (books) => {
  const subject = `There are ${books.length} kindle books on sale today 🔥`;
  const html = books.map(book => (
    `<p><a href="${book.link}">${book.title}</h>: $${book.price}</p>`
  )).join('');

  const mailOptions = {
    from: 'lhbext@gmail.com', // sender address
    to: 'lhbrennan@gmail.com', // list of receivers
    subject, // Subject line
    html, // plain text body
  };

  transporter.sendMail(mailOptions, (err, info) => console.log(err || info));
};
