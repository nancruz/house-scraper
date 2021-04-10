const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const db = low(new FileSync(path.join(__dirname, '../client/data/db.json')));
const results = db.get('results').value();

const itemsToKeep = results.reduce((itemsToKeep, result) => {
    const duplicate = results.find(({ title, price, id }) => {
        return (result.title.toLowerCase() === title.toLowerCase() && result.price === price && result.id !== id);
    });

    if (!duplicate || (duplicate && !itemsToKeep[duplicate.id])) {
        itemsToKeep[result.id] = result;
    }

    return itemsToKeep;
}, {});

console.log(`${results.length - Object.keys(itemsToKeep).length} to remove!`);

for (result of results) {
    if (!itemsToKeep[result.id]) {
        db.get('results').remove({ id: result.id }).write();
    }
}