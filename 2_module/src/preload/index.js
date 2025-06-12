import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  getPartners: () => ipcRenderer.invoke('getPartners'),
  getPartnerTypes: () => ipcRenderer.invoke('getPartnerTypes'),
  createPartner: (partner) => ipcRenderer.invoke('createPartner', partner),
  updatePartner: (partner) => ipcRenderer.invoke('updatePartner', partner),
  getPartnerDiscount: (partnerId) => ipcRenderer.invoke('getPartnerDiscount', partnerId),
  getPartnerSalesHistory: (partnerId) => ipcRenderer.invoke('getPartnerSalesHistory', partnerId)
};

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
};
