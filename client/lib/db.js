import houses from "../data/db.json";

export function getHouses() {
  return houses.results.sort((a, b) => b.parseDate - a.parseDate);
}

export function getAvailableLocations() {
  const locations = [];

  houses.results.forEach(({ location }) => {
    if (!locations.includes(location)) {
      locations.push(location);
    }
  });

  return locations;
}

