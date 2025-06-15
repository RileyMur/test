import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router";
import logo from './assets/electron.svg';

//Функция обработки доп данных
//Изменить по ситуации
export default function UnitHistory() {
  // Используем хук useLocation для получения данных из параметров маршрута
  const location = useLocation();
  // Используем хук useNavigate для навигации между страницами
  const navigate = useNavigate();
  //изменить по ситуации
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const partner = location.state?.partner;

  useEffect(() => {
    //Тут вместо партнеров указываем юнита, его поле или Общее название юнита
    // Устанавливаем заголовок документа
    document.title = `Заголовок доп страницы - ${partner?.partner_name || 'Партнер'}`;
    // Если партнер не выбран, перенаправляем на главную страницу
    const fetchSalesHistory = async () => {
      if (!partner) {
        navigate('/');
        return;
      }
      // Получаем историю продаж для выбранного партнера через API
      try {
        const data = await window.api.getUnitHistory(partner.partner_id);
        setSales(data);
      } catch (error) {
        // Логируем ошибку, если что-то пошло не так
        console.error('Error loading sales history:', error);
      } finally {
        // В любом случае завершаем загрузку
        setLoading(false);
      }
    };
    // Вызываем функцию получения истории продаж при монтировании компонента
    fetchSalesHistory();
    // Зависимости для повторного вызова: выбранный партнер и функция навигации
  }, [partner, navigate]);
    // Если партнер не определен, не рендерим ничего
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
      <div className="history-container">
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
