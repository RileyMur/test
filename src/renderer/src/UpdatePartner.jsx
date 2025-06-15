import { useEffect, useState } from "react";
import { useLocation, Link, useNavigate } from "react-router";
import logo from './assets/electron.svg';

export default function UpdateUnit() {
  // Используем хук useLocation для получения данных из параметров маршрута
  const location = useLocation();
  // Используем хук useNavigate для навигации между страницами
  const navigate = useNavigate();
  // Состояние для текущего
  const [partner, setPartner] = useState(location.state?.partner || {});
  // Состояние для типов
  const [partnerTypes, setPartnerTypes] = useState([]);

  useEffect(() => {
    (async () => {
    // Асинхронная функция для получения типов партнеров
      try {
        // Устанавливаем заголовок документа
        document.title = 'Редактировать партнера';
        // Получаем список типов партнеров через API
        const types = await window.api.getPartnerTypes();
        // Обновляем состояние с типами партнеров
        setPartnerTypes(types);
      } catch (error) {
        // Логируем ошибку, если не удалось получить типы партнеров
        console.error('Error loading partner types:', error);
      }
    })();
  }, []);
  // Функция обработки отправки формы
  async function handleSubmit(e) { 
    // Предотвращаем стандартное поведение формы
    e.preventDefault();
    // Создаем объект FormData из данных формы
    const formData = new FormData(e.target);
    // Подготавливаем обновленные данные партнера
    const updatedPartner = {
      partner_id: partner.partner_id,
      partner_type_id: parseInt(formData.get('partner_type_id')),
      partner_name: formData.get('partner_name'),
      manager: formData.get('manager'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      inn: parseInt(formData.get('inn')),
      rate: parseInt(formData.get('rate'))
    };

    try {
      // Обновляем данные партнера через API
      await window.api.updateUnit(updatedPartner);
      // После успешного обновления перенаправляем на главную страницу
      navigate('/');
    } catch (error) {
      // Логируем ошибку, если что-то пошло не так при обновлении
      console.error('Error updating partner:', error);
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <img src={logo} alt="Логотип компании" className="app-logo" />
          <h1 className="app-title">Управление партнерами</h1>
        </div>
      </header>
      <div className="form-container">
        <Link to="/" className="back-button">
          <span>Назад</span>
        </Link>
        
        <h1>Редактировать партнера</h1>
        
        {partner.partner_id ? (
          <form onSubmit={handleSubmit} 
          className="partner-form"
          onClick={(e) => e.stopPropagation()}
          >
            <div className="form-group">
              <label htmlFor="partner_name">Наименование:</label>
              <input 
                id="partner_name" 
                name="partner_name" 
                type="text" 
                required 
                maxLength="100"
                defaultValue={partner.partner_name}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="partner_type_id">Тип партнера:</label>
              <select 
                id="partner_type_id" 
                name="partner_type_id" 
                required
                defaultValue={partner.partner_type_id}
              >
                <option value="">Выберите тип</option>
                {partnerTypes.map(type => (
                  <option key={type.partner_type_id} value={type.partner_type_id}>
                    {type.partner_type}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="manager">ФИО директора:</label>
              <input 
                id="manager" 
                name="manager" 
                type="text" 
                required 
                maxLength="100"
                defaultValue={partner.manager}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="rate">Рейтинг:</label>
              <input 
                id="rate" 
                name="rate" 
                type="number" 
                min="0" 
                required 
                defaultValue={partner.rate}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Адрес:</label>
              <input 
                id="address" 
                name="address" 
                type="text" 
                required 
                maxLength="200"
                defaultValue={partner.address}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                maxLength="100"
                defaultValue={partner.email}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Телефон:</label>
              <input 
                id="phone" 
                name="phone" 
                type="tel" 
                required 
                maxLength="20"
                defaultValue={partner.phone}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="inn">ИНН:</label>
              <input 
                id="inn" 
                name="inn" 
                type="number" 
                required 
                min="1000000000" 
                max="9999999999"
                defaultValue={partner.inn}
              />
            </div>
            
            <button type="submit" className="submit-button">Сохранить изменения</button>
          </form>
        ) : (
          <p>Данные партнера не загружены</p>
        )}
      </div>
    </div>   
  );
}