# bookPriceChecker

A simple app that does the following daily:
* Fetches all book titles from a 'Book Recommendations' Airtable base
* Fetches today's Kindle price for each book by visiting its product page on Amazon
* Sends an email notification if the Kindle price is below a predetermined threshold

## Requirements

node.js

## Setup

1. `git clone https://github.com/lhbrennan/bookPriceChecker.git`
2. `npm install`
3. `touch .env`, then add the following environment variables:
    1. AIRTABLE_API_KEY
    2. CLIENT_ID
    3. CLIENT_SECRET
    4. REFRESH_TOKEN

## Usage

* `node app.js`
* If using heroku, do `heroku local web` to run locally

## Contributing

Pull requests are welcome.

## License

[MIT](https://choosealicense.com/licenses/mit/)

