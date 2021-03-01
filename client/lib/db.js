import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const dbDirectory = process.env.DB_PATH;
const db = lowdb(new FileSync(dbDirectory));

db.defaults({ results: []}).write();

export function getHouses() {
  return db.get('results').value();
}

