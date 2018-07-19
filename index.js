const puppeteer = require('puppeteer');
const { promisify } = require('util');

const fs = require('fs');
const writeFileAsync = promisify(fs.writeFile); // (A)

const data = {};
const getHost = (year, month) =>
  `https://www.hamropatro.com/calendar/${year}/${month}/`;
const recordsOfYears = [2075];
const months = (() =>
  Array(12)
    .fill(true)
    .map((item, index) => index + 1))();

const scrapHamroPatro = function scrapHamroPatro(page) {
  return async function*(host) {
    console.log(`Fetching ${host}`);
    await page.goto(host);
    const bodyHandle = await page.$('body');
    const body = await page.evaluate((body) => {
      const days = Array.from(
        body.querySelectorAll('.calendar .dates li:not(disable)')
      )
        .filter((item) => ![...item.classList].includes('disable'))
        .map((item) => ({
          tithi: item.querySelector('span.tithi').innerText,
          event: item.querySelector('span.event').innerText,
          day: item.querySelector('span.nep').innerText,
        }));
      return days;
    }, bodyHandle);

    yield body;
  };
};
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const scrap = scrapHamroPatro(page);
  try {
    for await (const year of recordsOfYears) {
      data[year] = [];
      for await (const month of months) {
        const monthIndex = data[year].push({ month });
        for await (const days of scrap(getHost(year, month))) {
          data[year][monthIndex - 1].days = days;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  await writeFileAsync('data.json', JSON.stringify(data));
  console.log('Finished...');
  await browser.close();
})();
