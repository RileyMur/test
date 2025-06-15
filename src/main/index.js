import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import connectDB from './db';

// async function foo(event, data) {
//   try {
//     console.log(data)
//     dialog.showMessageBox({ message: 'message back' })
//   } catch (e) {
//     dialog.showErrorBox('Ошибка', e)
//   }
// }

// async function getUnits() {
//   try {
//     const query = `
//     SELECT partners.*, products.product_name
//     FROM partners
//     JOIN products WHERE partners.id = products.partners_id
//     ORDER BY partners.name
//     `;
//     const res = global.client.query(query);
//     dialog.showMessageBox({ message: 'message back' })
//     return res.rows;
//   } catch (e) {
//     dialog.showErrorBox('Ошибка', e)
//   }
// }
//Функция получения основных данных из БД 
async function getData() {
    try {
      //Запрос
      const query = `
          SELECT table1.column, table2.column_red
          FROM table1
          JOIN table2 ON table1.id = table2.type_id
          ORDER BY table1.name
      `;
      //Сохраняем результат отправленного запроса
      const res = await global.dbclient.query(query);
      //Возвращаем строки ответа
      return res.rows;
    } catch (e) {
      //выводим окно с ошибкой
      dialog.showErrorBox('Ошибка', e);
    }
  };
  //Функция получения доп данных из БД для выпадающего списка
  async function getDataTypes() {
    try {
      //Сохраняем результат отправленного запроса
      const res = await global.dbclient.query('SELECT * FROM table1.type ORDER BY type');
      //Возвращаем строки ответа
      return res.rows;
    } catch (e) {
      //выводим окно с ошибкой
      dialog.showErrorBox('Ошибка', e)
    }
  };
  //Функция получения агрегированных данных из БД
  async function getSum(unitId) {  
    try {
      //Запрос
      const query = `
        SELECT SUM(table3.quantity) as total_quantity
        FROM table3
        WHERE table3.unit_id = $1
      `;
      //Сохраняем результат отправленного запроса
      const res = await global.dbclient.query(query, [partnerId]);
      //Сумма
      const totalQuantity = res.rows[0].total_quantity || 0;
      //Инициализируем переменную
      let discount = 0;
      //Условия установки значения
      if (totalQuantity > 300000) discount = 15;
      else if (totalQuantity > 50000) discount = 10;
      else if (totalQuantity > 10000) discount = 5;
      //Возвращаем объект со свойствами
      return { totalQuantity, discount };
    } catch (e) {
      //Выводим окно с ошибкой
      dialog.showErrorBox('Ошибка', e);
    }
  };
  //Функция получения доп данных из БД
  async function getUnitHistory(unitID) { 
    try {
      //Запрос c сортировкой по убыванию  (по возрастанию ASC)
      const query = `
        SELECT 
          table3.id,
          table4.products_name,
          table3.quantity,
          table3.date
        FROM table3
        JOIN table4 ON sales.products_id = table4.product_id
        WHERE table3.id = $1
        ORDER BY table3.date DESC
      `;
      const res = await global.dbclient.query(query, [unitId]);
      return res.rows;
    } catch (e) {
      dialog.showErrorBox('Ошибка', e);
    }
  };
  //Функция создания юнита
  //переделать под ситуацию
  async function createPartner(event, partner) {  
    try {
      await global.dbclient.query('BEGIN');
      const {
        partner_type_id,
        partner_name,
        manager,
        email,
        phone,
        address,
        inn,
        rate
      } = partner;
  //Запрос на получение данных из БД
      const query = `
        INSERT INTO partners (
          partner_type_id, 
          partner_name, 
          manager, 
          email, 
          phone, 
          address, 
          inn, 
          rate
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING partner_id
      `;
    //Массив со значениями данных из БД  
      const values = [
        partner_type_id,
        partner_name,
        manager,
        email,
        phone,
        address,
        inn,
        rate
      ];
      //Сохраняем результат отправленного запроса
      const res = await global.dbclient.query(query, values);
      await global.dbclient.query('COMMIT');
          
      dialog.showMessageBox({ 
        type: 'info',
        title: 'Успех',
        message: 'Блаблабла успешно добавлен' 
      });
      return res.rows[0].partner_id;
    } catch (e) {
      await dlobal.client.query('ROLLBACK');
      console.error('Ошибка при создании блаблабла:', e);
    }
  };
  //Функция редактирование юнита
  //Переделать под ситуацию
  async function updatePartner(event, partner) {  
    //Объект с данными юнита
    const {
      partner_id,
      partner_type_id,
      partner_name,
      manager,
      email,
      phone,
      address,
      inn,
      rate
    } = partner;
  
    try {
      //Начало транзакции
      await global.dbclient.query('BEGIN');
      //Запрос на изменение данных
      await global.dbclient.query(
        `UPDATE partners SET 
          partner_type_id = $1, 
          partner_name = $2, 
          manager = $3, 
          email = $4, 
          phone = $5, 
          address = $6, 
          inn = $7, 
          rate = $8
        WHERE partner_id = $9`,
        [partner_type_id, partner_name, manager, email, phone, address, inn, rate, partner_id]
      );
      //Конец транзакции
      await global.client.query('COMMIT');
  
      dialog.showMessageBox({ 
        type: 'info',
        title: 'Успех',
        message: 'Данные партнера успешно обновлены' 
      });
    } catch (e) {
      //Откат транзакции в случае ошибки
      //Переделать под ситуацию
      await global.dbclient.query('ROLLBACK');
      console.error('Тест ошибки', e);
  
      let errorMessage = 'Произошла ошибка при обновлении данных';
      if (e.code === '23505') {
        errorMessage = 'Сообщение об ошибке 23505';
      }
      //Вывод окна с сообщением об ошибке
      dialog.showErrorBox('Ошибка', errorMessage);
      throw e;
    }
  };
  //Функция создания UI окна
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  global.dbclient = await connectDB();
  //Регистрация обработчиков
  ipcMain.handle('getPartners', getPartners); //Основная функция получения данных из БД
  ipcMain.handle('getPartnerTypes', getPartnerTypes); //функция для выпадающего списка
  ipcMain.handle('createPartner', createPartner); //функция создания юнита
  ipcMain.handle('updatePartner', updatePartner); //функция изменения юнита
  ipcMain.handle('getSum', (event, unitId) => getSum(unitId));//агрегатная юнита
  ipcMain.handle('getUnitHistory', (event, unitId) => getUnitHistory(unitId));//история юнита

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
