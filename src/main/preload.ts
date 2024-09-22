import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'update-turn-name'
  | 'turn-description-changed'
  | 'update-turn-image'
  | 'add-turn-image'
  | 'page-image-deleted'
  | 'create-turn'
  | 'settings-select-path'
  | 'electron-store-get'
  | 'delete-turn'
  | 'modify-turn'
  | 'add-turn'
  | 'get-turn-name'
  | 'get-turn-description'
  | 'get-turn-page-image'
  | 'get-turn-images'
  | 'get-turn'
  | 'get-turns'
  | 'get-turn-map'
  | 'get-turn-gallery-data'
  | 'get-family'
  | 'get-family-gallery-data'
  | 'add-family'
  | 'modify-family'
  | 'delete-family'
  | 'edit-family';

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
