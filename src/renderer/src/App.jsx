import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from './assets/electron.svg';
import './styles.css';

function App() {
  // Используем хук useNavigate для навигации между страницами
  const navigate = useNavigate();
  // Состояние для текущего
  const [partners, setPartners] = useState([]);
  // Состояние для скидки
  const [discounts, setDiscounts] = useState({});
  

  useEffect(() => {
    (async () => {
      try {
        // Устанавливаем заголовок документа
        document.title = "Заголовок приложения";
        // Получаем список основного вывода
        const partners = await window.api.getPartners();
        // Обновляем состояние
        setPartners(partners);
        // Создаем объект для хранения скидок
        const discountsData = {};
        for (const partner of partners) {
          const discountInfo = await window.api.getPartnerDiscount(partner.partner_id);
          discountsData[partner.partner_id] = discountInfo;
        }
        // Обновляем состояние
        setDiscounts(discountsData);
      } catch (error) {
        console.error('Ошибка загрузки партнера:', error);
      }
    })();
  }, []);


  return (
    <>
      <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <img src={logo} alt="Логотип компании" className="app-logo" />
          <h1 className="app-title">Управление партнерами</h1>
        </div>
        <Link to="/create">
          <button className="button primary-button">Добавить партнера</button>
        </Link>
      </header>
      
      <main className="main-container">
        <div className="page-heading">
          <h1>Список юнитов</h1>
        </div>
        
        <div>
          {partners.length > 0 ? (
            partners.map(partner => (
              <div key={partner.partner_id} 
              className="card"
              onClick={() => navigate('/update', { state: { partner } })}
              style={{ cursor: 'pointer' }}
              >
                <div className="info">
                  <h3 data-discount={`${discounts[partner.partner_id]?.discount || 0}%`}>
                    {partner.partner_type} | {partner.partner_name}
                  </h3>
                  <p>{partner.manager}</p>
                </div>
                <div className="contacts">
                  <p>+{partner.phone}</p>
                  <p>{partner.email}</p>
                  <p>{partner.address}</p>
                </div>
                <p>Рейтинг: {partner.rate}</p>
                <div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/sales-history', { state: { partner } });
                  }}
                    className="history-button"
                  >
                    История
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Нет данных</p>
          )}
        </div>
      </main>
    </div>
    </>
  )
}

export default App

