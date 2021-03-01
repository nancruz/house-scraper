import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const dbDirectory = '/Users/NCZ01/playground/house-scraping/scraper/db.json';
const db = lowdb(new FileSync(dbDirectory));

db.defaults({ results: []}).write();

export function getHouses() {
  return db.get('results').value();
}

