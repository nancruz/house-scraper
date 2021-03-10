import { useState } from 'react';
import { getAvailableLocations, getHouses } from '../lib/db';
import style from '../styles/Home.module.css'

function HouseItem({ link, title, price, location, photo, parseDate }) {
  return (
    <li className={style.houseItem}>
      <a href={link} target="_blank" rel="noopener noreferrer">
        <div className={style.houseItemPicture}>
          <picture>
            <img loading='lazy' src={photo}/>
          </picture>
        </div>
        <div className={style.houseItemMetadata}>
          <h3>{title}</h3>
          <p>💰 {price}€</p>
          <p>📍 {location}</p>
          <p>🗓 {new Date(parseDate).toDateString()}</p>
        </div>
      </a>
    </li>
  );
}

function LocationFilters({ locations = [], onClick, activeFilters }) {
  return (
    <ul className={style.locationFilterList}>
      {locations.map(location => {
        const isActive = activeFilters.includes(location);

        return (
          <li key={location}>
            <button
              className={`${style.locationFilter} ${isActive ? style.locationFilterActive : ''}`}
              onClick={() => onClick(location)}>
                {location}
            </button>
          </li>
      )})}
    </ul>
  )
}

export default function Home({ houses = [], locations = [] }) {
  const [activeLocations, setActiveLocations] = useState([]);
  const filteredHouses = activeLocations.length > 0 ? 
    houses.filter(({ location }) => activeLocations.includes(location)) :
    houses;

  const onClickLocation = (location) => {
    const locationIndex = activeLocations.indexOf(location);

    if (locationIndex > -1) {
      setActiveLocations([...activeLocations.slice(0, locationIndex), ...activeLocations.slice(locationIndex + 1)]);
    } else {
      setActiveLocations([...activeLocations, location]);
    }
  }

  return (
    <>
      <h1 className={style.title}>Lista de Casas</h1>
      <LocationFilters locations={locations} activeFilters={activeLocations} onClick={onClickLocation}/>
      <ul className={style.houseList}>
        {filteredHouses.map(({ id, link, title, price, location, photo, parseDate }) => (
          <HouseItem key={id} link={link} title={title} price={price} location={location} photo={photo} parseDate={parseDate} />
        ))}
      </ul>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      houses: getHouses(),
      locations: getAvailableLocations()
    }
  }
}
