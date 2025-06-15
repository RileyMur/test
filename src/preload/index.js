import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  //API-методы для запроса через IPC
  getUnits: () => ipcRenderer.invoke('getUnits'),
  getUnitTypes: () => ipcRenderer.invoke('getUnitTypes'),
  createPartner: (partner) => ipcRenderer.invoke('createPartner', partner),
  updatePartner: (partner) => ipcRenderer.invoke('updatePartner', partner),
  getSum: (partnerId) => ipcRenderer.invoke('getSum', unitId),
  getUnitHistory: (partnerId) => ipcRenderer.invoke('getPartnerSalesHistory', unitId)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
