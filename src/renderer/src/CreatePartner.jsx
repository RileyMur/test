import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import logo from './assets/electron.svg';

export default function CreatePartner() {
  // Используем хук useNavigate для навигации между страницами
  const navigate = useNavigate();
  // Состояние для текущего
  const [partnerTypes, setPartnerTypes] = useState([]);
// Используем хук useEffect для выполнения побочных эффектов при монтировании компонента
  useEffect(() => {
    (async () => {
      // Асинхронная функция для получения
      try {
        // Устанавливаем заголовок документа
        document.title = 'Добавить партнера';
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
  // Асинхронная функция обработки отправки формы
  async function handleSubmit(e) {
    // Предотвращаем стандартное поведение формы
    e.preventDefault();
    try {
      // Создаем объект FormData из данных отправленной формы
      const formData = new FormData(e.target);
      // Формируем объект, используя данные из формы
      const partner = {
        partner_type_id: parseInt(formData.get('partner_type_id')),
        partner_name: formData.get('partner_name').trim(),
        manager: formData.get('manager').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        address: formData.get('address').trim(),
        inn: parseInt(formData.get('inn')),
        rate: parseInt(formData.get('rate'))
      };
      // Проверяем, заполнены ли обязательные поля
      if (!partner.partner_name || !partner.manager || !partner.email) {
        // Если какое-либо из обязательных полей пусто, выбрасываем ошибку
        throw new Error('Заполните обязательные поля');
      }
      // Вызываем API для создания нового партнера и получаем его ID
      const createdId = await window.api.createPartner(partner);
      // Выводим сообщение о успешном создании партнера в консоль
      console.log('Создан партнер с ID:', createdId);
      // Перенаправляем пользователя на главную страницу после успешного создания
        navigate('/');
    } catch (error) {
      // Логируем ошибку в консоль, если что-то пошло не так при создании партнера
      console.error('Ошибка создания партнера:', error);
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
        
        <form onSubmit={handleSubmit} className="partner-form">
          <div className="form-group">
            <label htmlFor="partner_name">Наименование:</label>
            <input 
              id="partner_name" 
              name="partner_name" 
              type="text" 
              required 
              maxLength="100"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="partner_type_id">Тип партнера:</label>
            <select id="partner_type_id" name="partner_type_id" required>
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
            />
          </div>
          
          <button type="submit" className="submit-button">Добавить партнера</button>
        </form>
      </div>
    </div>  
  );
}