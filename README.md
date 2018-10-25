# bookPriceChecker

A simple app that does the following daily:
* Fetches all book titles from a 'Book Recommendations' Airtable base
* Fetches today's Kindle price for each book by visiting its product page on Amazon
* Sends an email notification if the Kindle price is below a predetermined threshold

## Installation
1 - npm install
2 - in your root directory, create KEYS.js, and add the following lines:
exports.AIRTABLE_API_KEY = YOUR_KEY;
exports.gmailPw = YOUR_PASSWORD;

### Requirements
node.js

## Usage

It runs automatically once per day

## Contributing
Pull requests are welcome.

## License
[MIT](https://choosealicense.com/licenses/mit/)