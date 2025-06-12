import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import pg from 'pg'

const dbConfig = {
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: '5432',
  database: 'partners'
}
async function getPartners() {
  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    const query = `
      SELECT p.*, pt.partner_type 
      FROM partners p
      JOIN partners_types pt ON p.partner_type_id = pt.partner_type_id
      ORDER BY p.partner_name
    `;

    const res = await client.query(query);
    console.log(res.rows);
    return res.rows;

  } catch (e) {
    console.log("Ошибка получения данных");
  } finally {
    await client.end();
  }
};

async function getPartnerTypes() {
  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    const res = await client.query('SELECT * FROM partners_types ORDER BY partner_type');
    return res.rows;
  } catch (e) {
    console.error('Ошибка получения типа партнера:', e);
    throw e;
  } finally {
    await client.end();
  }
};

async function getPartnerDiscount(partnerId) {
  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    const query = `
      SELECT SUM(s."quantity of production") as total_quantity
      FROM sales s
      WHERE s.partner_id = $1
    `;
    const res = await client.query(query, [partnerId]);
    
    const totalQuantity = res.rows[0].total_quantity || 0;
    let discount = 0;
    
    if (totalQuantity > 300000) discount = 15;
    else if (totalQuantity > 50000) discount = 10;
    else if (totalQuantity > 10000) discount = 5;
    
    return { totalQuantity, discount };
  } catch (e) {
    console.error('Ошибка расчета скидки для партнера:', e);
    throw e;
  } finally {
    await client.end();
  }
};

async function getPartnerSalesHistory(partnerId) {
  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    const query = `
      SELECT 
        s.id,
        pn.products_name,
        s."quantity of production" as quantity,
        s.date_of_sale
      FROM sales s
      JOIN products_names pn ON s.products_id = pn.product_id
      WHERE s.partner_id = $1
      ORDER BY s.date_of_sale DESC
    `;
    const res = await client.query(query, [partnerId]);
    return res.rows;
  } catch (e) {
    console.error('Error fetching partner sales history:', e);
    throw e;
  } finally {
    await client.end();
  }
}


async function createPartner(event, partner) {
  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    await client.query('BEGIN');
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
    
    const res = await client.query(query, values);
    await client.query('COMMIT');
        
    dialog.showMessageBox({ 
      type: 'info',
      title: 'Успех',
      message: 'Партнер успешно добавлен' 
    });
    return res.rows[0].partner_id;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Ошибка при создании партнера:', e);
    
    if (e.code === '23505') {
      if (e.constraint === 'partners_pkey') {
        throw new Error('Системная ошибка: конфликт идентификаторов. Попробуйте еще раз.');
      } else {
        throw new Error('Партнер с такими данными уже существует');
      }
    } else {
      throw new Error('Ошибка при создании партнера: ' + e.message);
    }
  } finally {
    await client.end();
  }
};

async function updatePartner(event, partner) {
  const client = new pg.Client(dbConfig);
  await client.connect();

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
    await client.query('BEGIN');
    await client.query(
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

    await client.query('COMMIT');

    dialog.showMessageBox({ 
      type: 'info',
      title: 'Успех',
      message: 'Данные партнера успешно обновлены' 
    });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Ошибка при обновлении партнера:', e);

    let errorMessage = 'Произошла ошибка при обновлении партнера';
    if (e.code === '23505') {
      errorMessage = 'Партнер с таким ИНН уже существует';
    }

    dialog.showErrorBox('Ошибка', errorMessage);
    throw e;
  } finally {
    await client.end();
  }
};

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
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

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  ipcMain.handle('getPartners', getPartners)
  ipcMain.handle('getPartnerTypes', getPartnerTypes)
  ipcMain.handle('createPartner', createPartner)
  ipcMain.handle('updatePartner', updatePartner)
  ipcMain.handle('getPartnerDiscount', (event, partnerId) => getPartnerDiscount(partnerId));
  ipcMain.handle('getPartnerSalesHistory', (event, partnerId) => getPartnerSalesHistory(partnerId));
  
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
