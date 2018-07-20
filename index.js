const puppeteer = require('puppeteer');
const { promisify } = require('util');
const fs = require('fs');

const writeFileAsync = promisify(fs.writeFile); // (A)

const SAVE_FILE_FOR_EACH_YEAR = true;

const RECORDS_OF_YEAR = [];
for (let y = 2070; y <= 2075; y++) {
  RECORDS_OF_YEAR.push(y);
}
const MONTHS = (() =>
  Array(12)
    .fill(true)
    .map((item, index) => index + 1))();

const data = {};
const getHost = (year, month) =>
  `https://www.hamropatro.com/calendar/${year}/${month}/`;

const scrapHamroPatro = function scrapHamroPatro(page) {
  return async function*(host) {
    console.log(`Fetching ${host}`);
    await page.goto(host);
    const bodyHandle = await page.$('body');
    const body = await page.evaluate((body) => {
      const tableOfNepEngNums = new Map([
        ['०', 0],
        ['१', 1],
        ['२', 2],
        ['३', 3],
        ['४', 4],
        ['५', 5],
        ['६', 6],
        ['७', 7],
        ['८', 8],
        ['९', 9],
      ]);

      function nepToEngNum(strNum) {
        return String(strNum)
          .split('')
          .map(function(ch) {
            if (ch === '.' || ch === ',') {
              return ch;
            }
            return tableOfNepEngNums.get(ch);
          })
          .join('');
      }
      const days = Array.from(
        body.querySelectorAll('.calendar .dates li:not(disable)')
      )
        .filter((item) => ![...item.classList].includes('disable'))
        // no optimization, if u need u can do
        .map((item) => ({
          isHoliday: [...item.classList].includes('holiday'),
          tithi: (item.querySelector('span.tithi') || {}).innerText,
          event: (item.querySelector('span.event') || {}).innerText,
          day: (item.querySelector('span.nep') || {}).innerText,
          dayInEn: nepToEngNum(
            (item.querySelector('span.nep') || {}).innerText
          ),
          en: (item.querySelector('span.eng') || {}).innerText,
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
    for await (const year of RECORDS_OF_YEAR) {
      data[year] = [];
      for await (const month of MONTHS) {
        const monthIndex = data[year].push({ month });
        for await (const days of scrap(getHost(year, month))) {
          data[year][monthIndex - 1].days = days;
        }
      }
      if (SAVE_FILE_FOR_EACH_YEAR) {
        await writeFileAsync(
          `data/years/${year}.json`,
          JSON.stringify(data[year])
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
  if (!SAVE_FILE_FOR_EACH_YEAR) {
    await writeFileAsync('data/data.json', JSON.stringify(data));
  }
  console.log('Finished...');
  await browser.close();
})();
