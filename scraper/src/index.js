const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Memory = require('lowdb/adapters/Memory');
const Logger = require('js-logger');

(async () => {
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
  const urls = config.urls;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let results = [];

  const db = low(
    process.env.NODE_ENV === 'development'
    ? new Memory()
    : new FileSync('db.json')
  );

  Logger.useDefaults();

  if (config.logLevel) {
    Logger.setLevel(config.logLevel);
  }

  db.defaults({ results: []}).write();

  Logger.info(`${urls.length} urls found. Starting parse processs...`);

  for(let i = 0; i < urls.length; i++) {
    Logger.info(`Parsing ${i+1} of ${urls.length}...`);

    const url = urls[i];
    const parsedResults = await parseURL(page, db, url); 

    if (Array.isArray(parsedResults)) {
      const filteredResults = parsedResults.filter(item => {
        return !db.get('results').find({id: item.id}).value() && !results.find(({ id }) => item.id === id);
      });

      results.push(...filteredResults);

      Logger.info(`Found ${filteredResults.length} new results.`);
    }
  }

  db.get('results').push(...results).write();

  await browser.close();

  Logger.info("Parsing process ended.");
})();

async function parseURL(page, db, url) {
  await page.goto(url.url, {waitUntil: 'load', timeout: 0});

  try {
    await page.waitForSelector('.search-location-extended-warning');
    Logger.info("Results not found.");
    return [];
  } catch {
    Logger.info("Found results.");
  }

  return await page.$$eval('.section-listing__row-content article', (articles, location) => {
    let newResults = [];

    for(article of articles) {
      const titleElem = article.querySelector('.offer-item-details .offer-item-title');
      const priceElem = article.querySelector('.offer-item-details .offer-item-price');
      const linkElem = article.querySelector('.offer-item-details a');
      const photoElem = article.querySelector('.offer-item-image .img-cover');

      if (titleElem && priceElem && linkElem && photoElem) {
        const obj = {
          title: titleElem.textContent,
          price: parseInt(priceElem.textContent.replace('\n', '').replace(/ /g, '').replace('€', '').trim()),
          link: linkElem.href,
          id: `imovirtual_${article.dataset.itemId}`,
          photo: photoElem.dataset.src,
          location: location,
          parseDate: new Date().getTime()
        };

        newResults.push(obj);
      }
    }
    return newResults; 
  }, url.location);
}

function imagesHaveLoaded() { return Array.from(document.images).every((i) => i.complete); }

