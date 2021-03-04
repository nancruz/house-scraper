import { getHouses } from '../lib/db';
import style from '../styles/Home.module.css'

function HouseItem({ link, title, price, location, photo }) {
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
          <p>{price}€</p>
          <p>{location}</p>
        </div>
      </a>
    </li>
  );
}

export default function Home({ houses = [] }) {
  return (
    <>
    <h1 className={style.title}>Houses List</h1>
    <ul className={style.houseList}>
      {houses.map(({ id, link, title, price, location, photo }) => (<HouseItem key={id} link={link} title={title} price={price} location={location} photo={photo} />))}
    </ul>
    </>
  )
}

export async function getStaticProps() {
  return {
    props: {
      houses: getHouses()
    }
  }
}
