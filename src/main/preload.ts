import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'album-title-changed'
  | 'album-description-changed'
  | 'page-image-changed'
  | 'page-image-added'
  | 'page-image-deleted'
  | 'create-album'
  | 'settings-select-path'
  | 'electron-store-get'
  | 'get-album-title'
  | 'get-album-description'
  | 'get-album-page-image'
  | 'get-album-images'
  | 'get-album'
  | 'get-albums'
  | 'get-album-map'
  | 'get-album-gallery-data'
  | 'get-volume'
  | 'get-volume-gallery-data';

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  store: {
    get(key: string) {
      return ipcRenderer.sendSync('electron-store-get', key);
    },
    set(property: string, val: unknown) {
      ipcRenderer.send('electron-store-set', property, val);
    },
  },
});
