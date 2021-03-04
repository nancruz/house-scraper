import lowdb from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const db = lowdb(new FileSync(process.env.DB_PATH));

db.defaults({ results: []}).write();

export function getHouses() {
  return db.get('results').value();
}

