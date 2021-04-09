# House Scraper

Web scraper to collect houses posted in real state websites. This project is configured to have my house preferences (price, location, ...). If you are interested in having it working for your use case, you can fork the project and adapt the `scraper/src/config.json`.

## How it works
Currently, the only supported website is [Imovirtual](https://www.imovirtual.com/en/). To add a new entry in the configuration file:
- Go to the real state website;
- Choose your filters;
- Copy the url;
- Add a new entry in the configuration with:
-- source (see Available Sources)
-- location 
-- url (the only previously copied)

The scraper uses [Puppeteer](https://pptr.dev/) to collect the information from the websites and then stores it in a json file. It runs every day at 12:00am and the job is triggered by a github action (`./github/workflows/main.yml`).

## Availble Sources
- IMOVIRTUAL