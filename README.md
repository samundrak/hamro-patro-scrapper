# Scrapper

Scraps days,events, tithi from (HamroPatro.com) from any given year to any give months

### Nepali Tithi

nepali calendar api conisiting of both AD and BS dates with 'tithi' and other Nepal specific info. goto `data` folder for already downloaded records

## Usage

- Clone this repo
- Go to project root
- Run `npm i`
- Run `node index.js`
- Open file `data.json` to see result

## Custom Date

Goto file `index.js`

````
// index.js
const recordsOfYears = [2075]; // Add or remove years you want data of.
const months = (() =>
  Array(12)
    .fill(true)
    .map((item, index) => index + 1))(); // Months of year you want to scrap
    ```
````
