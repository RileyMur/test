import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from './assets/logo.png';
import './styles.css';

function App() {
  const [partners, setPartners] = useState([]);
  const [discounts, setDiscounts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Управление партнерами";

    const fetchPartners = async () => {
      try {
        const data = await window.api.getPartners();
        setPartners(data);

        const discountsData = {};
        for (const partner of data) {
          const discountInfo = await window.api.getPartnerDiscount(partner.partner_id);
          discountsData[partner.partner_id] = discountInfo;
        }
        setDiscounts(discountsData);
      } catch (error) {
        console.error('Ошибка загрузки партнера:', error);
      }
    };
    fetchPartners();
  }, []);

  return (
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
          <h1>Список партнеров</h1>
        </div>
        
        <div className="partners-list">
          {partners.length > 0 ? (
            partners.map(partner => (
              <div key={partner.partner_id} 
              className="partner-card"
              onClick={() => navigate('/update', { state: { partner } })}
              style={{ cursor: 'pointer' }}
              >
                <div className="partner-info">
                  <h3 data-discount={`${discounts[partner.partner_id]?.discount || 0}%`}>
                    {partner.partner_type} | {partner.partner_name}
                  </h3>
                  <p>{partner.manager}</p>
                </div>
                <div className="partner-contacts">
                  <p>+{partner.phone}</p>
                  <p>{partner.email}</p>
                  <p>{partner.address}</p>
                </div>
                <p>Рейтинг: {partner.rate}</p>
                <div className="partner-actions">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/sales-history', { state: { partner } });
                  }}
                    className="history-button"
                  >
                    История продаж
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Нет данных о партнерах</p>
          )}
        </div>
      </main>
    </div>
  )
};

export default App;
