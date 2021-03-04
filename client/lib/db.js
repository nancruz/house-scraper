import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const db = lowdb(new FileSync("../data/db.json"));

db.defaults({ results: []}).write();

export function getHouses() {
  return db.get('results').value();
}

