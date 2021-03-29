const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const Memory = require('lowdb/adapters/Memory');
const Logger = require('js-logger');

require('dotenv').config();

(async () => {
  //const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')));
  const config = {
    urls: [
      { source:"SAPO", url: "https://casa.sapo.pt/comprar-apartamentos/t2-ate-t6-ou-superior/lisboa/?gp=260000&ly=2000", location: 'Lisboa'}
    ]
  };
  const urls = config.urls;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let results = [];

  const db = low(
    process.env.NODE_ENV === 'development'
    ? new Memory()
    : new FileSync(process.env.DB_PATH)
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
    let parsedResults;
    
    switch (url.source) {
      case 'IMOVIRTUAL': 
        parsedResults = await parseURL(page, db, url);
        break;
      case 'SAPO':
        parsedResults = await parseSapoURL(page, db, url);
        break;
      default:
        Logger.info('Unknown source');
    }

    console.log(parsedResults);

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

async function parseSapoURL(page, db, url) {
  await page.goto(url.url, {waitUntil: 'load', timeout: 0});

  try {
    await page.waitForSelector('#divSearchPageResults');
    Logger.info("Found results.");
  } catch {
    Logger.info("Results not found.");
    return [];
  }


  return await page.$$eval('#divSearchPageResults .searchResultProperty', (results, location) => {
    let newResults = [];

    for(result of results) {
      const titleElem = result.querySelector('.titleG3');
      const priceElem = result.querySelector('.searchPropertyPrice span');
      const linkElem = result.querySelector('a');
      const photoElem = result.querySelector('.photoContainer img');

      const obj = {
        title: titleElem.textContent,
        price: parseInt(priceElem.textContent.replace('\n', '').replace(/ /g, '').replace('€', '').trim()),
        link: linkElem.href,
        id: `imovirtual_${result.dataset.dataUid}`,
        photo: photoElem.dataset.src,
        location: location,
        parseDate: new Date().getTime()
      };

      newResults.push(obj);
    }

    return newResults;
  }, url.location);
}

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

