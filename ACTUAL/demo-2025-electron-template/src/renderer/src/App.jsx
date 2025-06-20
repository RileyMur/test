import { useEffect, useState } from 'react'
import {Link, useNavigate} from 'react-router'
import electronLogo from './assets/electron.svg'

function App() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'БЛАБЛАБЛА';
    (async () => {
      setData(await window.api.getData());
    })()
  }, [])

  return (
    <>
      <div className='logo-c'>
        <img alt="logo" className="logo" src={electronLogo} />
        <div className='title'>ЗАголовок</div>
      </div>
      <div className='main-container'>
        <Link to="/create">
          <button className="button primary-button">Добавить партнера</button>
          </Link>
        <ul className='data-list'>
          {data.map((item) => {
            return <li className="item-card" key={item.id}>
              <p className='card_heading'>{item.partner_name}</p>
              <div className='item-data-info'>
                <p>{item.partner_type}</p>
                <p><b>Менеджер: </b>{item.manager}</p>
                <p><b>email: </b>{item.email}</p>
                <p>{item.phone}</p>
                <p>{item.address}</p>
                <p><b>ИНН: </b>{item.inn}</p>
                <p><b>Рейтинг: </b>{item.rate}</p>
                <Link to="/update">
                  <button className="button update-button">Редактировать</button>
                </Link>
              </div>
            </li>
          })}
        </ul>
      </div>
    </>
  )
}

export default App

