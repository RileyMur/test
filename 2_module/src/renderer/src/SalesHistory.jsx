import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router";
import logo from './assets/logo.png';

export default function SalesHistory() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const partner = location.state?.partner;

  useEffect(() => {
    document.title = `История продаж - ${partner?.partner_name || 'Партнер'}`;
    
    const fetchSalesHistory = async () => {
      if (!partner) {
        navigate('/');
        return;
      }
      
      try {
        const data = await window.api.getPartnerSalesHistory(partner.partner_id);
        setSales(data);
      } catch (error) {
        console.error('Error loading sales history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSalesHistory();
  }, [partner, navigate]);

  if (!partner) {
    return null;
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <img src={logo} alt="Логотип компании" className="app-logo" />
          <h1 className="app-title">Управление партнерами</h1>
        </div>
      </header>
      <div className="sales-history-container">
        <Link to="/" className="back-button">
          <span>Назад</span>
        </Link>
        
        <h1>История продаж: {partner.partner_name}</h1>
        
        {loading ? (
          <p>Загрузка данных...</p>
        ) : sales.length > 0 ? (
          <div className="sales-table">
            <table>
              <thead>
                <tr>
                  <th>Дата продажи</th>
                  <th>Наименование продукции</th>
                  <th>Количество</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.date_of_sale).toLocaleDateString()}</td>
                    <td>{sale.products_name}</td>
                    <td>{sale.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Нет данных о продажах</p>
        )}
      </div>
    </div>  
  );
};
