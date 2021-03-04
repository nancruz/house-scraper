const express = require('express');
const fs = require('fs');

require('dotenv').config();

const app = express();
const port = process.env.SERVER_PORT;

app.get('/', (req, res) => {
    let obj = { 'results': [] };
    try {
        const data = fs.readFileSync(process.env.DB_PATH, 'utf8');
        obj = JSON.parse(data);
    } catch(e) {
        console.log('Failed to read DB.');
    }

    res.json(obj);
})

app.listen(port, () => {
  console.log(`Server started...`);
})