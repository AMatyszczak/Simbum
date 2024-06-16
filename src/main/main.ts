/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog, ipcRenderer } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import fs from 'fs';
import Store, { Schema } from 'electron-store';
import { resolveHtmlPath } from './util';
import { v4 as uuidv4 } from 'uuid';
// import placeholder from 'img_placeholder.png';


interface UserPreferences {
  rootPath: string;
  pagesList: string[];
}

const schema: Schema<UserPreferences> = {
  rootPath: {
    type: 'string',
  },
  pagesList: {
    type: 'array',
  },
};
const store = new Store<UserPreferences>({ schema });

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

function createPathIfNotExists(p: string) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}

function createPathToAlbum(rootPath: string, albumId: string) {
  return path.join(rootPath, "albums", albumId);
}

function createPathToImage(rootPath: string, albumId:string, imageId: string) {
  return path.join(rootPath, "albums", albumId, "images", imageId.concat(".png"));
}

ipcMain.on('page-image-changed', async (event, args) => {
  console.log("page-image-changed")
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const albumId = args[0];
    const imageId = args[1];
    const file = fs.readFileSync(args[2]);

    const albumPath = createPathToAlbum(rootPath, albumId);
    const imagePath = createPathToImage(rootPath, albumId, imageId);

    const imagesMapFile = fs.readFileSync(path.join(albumPath, "images_map.json"))
    const imagesMap = JSON.parse(imagesMapFile.toString())
    const index = imagesMap["images"].findIndex((imgJson: {id: string; filename: string }) => imgJson.id == imageId, 0)

    if(index == -1) {
      console.log("page-image-changed added missing image file")
      imagesMap["images"].splice(0, 0, {
        "id": imageId,
        "filename": imageId + ".png"
      })
      fs.writeFileSync(path.join(albumPath, "images_map.json"), JSON.stringify(imagesMap))

    }

    console.log("page-image-changed", rootPath, albumId, imageId)
    fs.writeFileSync(imagePath, file);
  }
});

ipcMain.on('album-title-changed', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const albumId = args[1];
    const albumPath = createPathToAlbum(rootPath, albumId);
    createPathIfNotExists(albumPath);
    const value = args[2];
    fs.writeFileSync(`${albumPath}/title.txt`, value);
  }
});

ipcMain.on('page-image-deleted', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const albumId = args[0];
    const imageId = args[1];
    
    const albumPath = createPathToAlbum(rootPath, albumId);
    const imagePath = createPathToImage(rootPath, albumId, imageId);
    
    const imagesMapFile = fs.readFileSync(path.join(albumPath, "images_map.json"))
    const imagesMap = JSON.parse(imagesMapFile.toString())
    const index = imagesMap["images"].findIndex((imgJson: { id: string; filename: string }) => imgJson.id === imageId, 0)

    if (index > -1) {
      if (imagesMap["images"].length == 1) {
        console.log("Replacing imageId:", imageId, "with placeholder")
        const placeHolderImage = fs.readFileSync("assets/img_placeholder.png");
        fs.writeFileSync(imagePath, placeHolderImage)
      } else {
        imagesMap["images"].splice(index, 1);
        fs.unlinkSync(imagePath)
        fs.writeFileSync(path.join(albumPath, "images_map.json"), JSON.stringify(imagesMap))
      }
    }
  }
});

ipcMain.on('page-image-added', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const albumId = args[0];
    const indexOfImage = args[1]
    const file = fs.readFileSync(args[2]);
    
    const imageId = uuidv4()
    const imagePath = createPathToImage(rootPath, albumId, imageId);
    fs.writeFileSync(imagePath, file);
    
    const albumPath = createPathToAlbum(rootPath, albumId)
    let imagesMapFile = fs.readFileSync(path.join(albumPath, "images_map.json"))
    let imagesMap = JSON.parse(imagesMapFile.toString())
    imagesMap["images"].splice(indexOfImage, 0, {
      "id": imageId,
      "filename": imageId + ".png"
    })

    fs.writeFileSync(path.join(albumPath, "images_map.json"), JSON.stringify(imagesMap))
    
    imagesMap["images"].forEach((element: any) => {
      element["path"] = "file://" + path.join(albumPath, "images", element.filename)
    });

    event.reply('get-album-images', imagesMap["images"])
  }
});

ipcMain.on('create-album', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const newAlbumIndex = args[0];
    const newAlbumId = uuidv4();
    const firstImageId = uuidv4()
    const placeHolderImage = fs.readFileSync("assets/img_placeholder.png");

    const albumPath = createPathToAlbum(rootPath, newAlbumId);
    const imagePath = createPathToImage(rootPath, newAlbumId, firstImageId);
    createPathIfNotExists(albumPath);
    createPathIfNotExists(path.join(albumPath, "images"));

    fs.writeFileSync(path.join(albumPath, 'title.txt'), '');
    fs.writeFileSync(path.join(albumPath, 'description.txt'), '');
    fs.writeFileSync(path.join(albumPath, "images_map.json"), JSON.stringify({'images':[{'id': firstImageId, "filename": firstImageId + ".png"}]}))
    fs.writeFileSync(imagePath, placeHolderImage)
    
    
    let albumsMapFile = fs.readFileSync(path.join(rootPath, "album_map.json"))
    let albumsMap = JSON.parse(albumsMapFile.toString())
    albumsMap["albums"].splice(newAlbumIndex, 0, {
      "id": newAlbumId
    })

    fs.writeFileSync(path.join(rootPath, "album_map.json"), JSON.stringify(albumsMap))    
    event.reply('get-album-map', albumsMap["albums"])
  }
})
    
ipcMain.on('album-description-changed', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const contentName = args[1];
    const contentPath = createPathToAlbum(rootPath, contentName);
    createPathIfNotExists(contentPath);
    const value = args[2];

    console.log('album-description-changed', contentPath, value)    
    fs.writeFileSync(`${contentPath}/description.txt`, value);
  }
});

ipcMain.on('get-albums', async (event, arg) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    let albums = fs.readdirSync(path.join(rootPath, "albums"))
    event.reply('get-albums', albums);
  }
});

ipcMain.on('get-album-map', async (event, arg) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const albumMapFilePath = path.join(rootPath, "album_map.json")
    if(fs.existsSync(albumMapFilePath)) {
      let albumMapFile = fs.readFileSync(path.join(rootPath, "album_map.json"))
      let albumMap = JSON.parse(albumMapFile.toString())
  
      event.reply('get-album-map', albumMap["albums"])
    }
  }
})


ipcMain.on('get-album-title', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const contentName = args[0];
    if (contentName == null) {
      event.reply('get-album-title',null);  
    } else {
      const contentPath = createPathToAlbum(rootPath, contentName);
      const fileContent = fs.readFileSync(`${contentPath}/title.txt`);
      event.reply('get-album-title', fileContent.toString());
    }
  }
});

ipcMain.on('get-album-description', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const contentName = args[0];
    if (contentName == null) {
      event.reply('get-album-description',null);  
    } else {
      const contentPath = createPathToAlbum(rootPath, contentName);
      const fileContent = fs.readFileSync(`${contentPath}/description.txt`);
      event.reply('get-album-description', fileContent.toString());
    }
  }
});

ipcMain.on('get-album-page-image', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const albumId = args[0];
    const imageId = args[1];
    if (albumId == null || imageId == null) {
      event.reply('get-album-page-image',null, null);  
    } else {
      const imagePath = createPathToImage(rootPath, albumId, imageId);
      const fileExists = fs.existsSync(imagePath);
      event.reply(
        'get-album-page-image',
        fileExists ? `file://${imagePath}` : null
      );
    }
  }
});

ipcMain.on('get-album', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const albumId = args[0]
    if (albumId == null) {
      event.reply('get-album', null);
    } else {
      const albumPath = createPathToAlbum(rootPath, albumId);
      const albumExists = fs.existsSync(albumPath);
      if (!albumExists) {
        event.reply('get-album', null);
      }
      const albumImagesFolderExists = fs.existsSync(path.join(albumPath, "images"));
      if (!albumImagesFolderExists) {
        event.reply('get-album', null);
      }
      const albumTitleExists = fs.existsSync(path.join(albumPath, 'title.txt'))
      if(!albumTitleExists) {
        event.reply('get-album', null);
      }
      const albumDescriptionExists = fs.existsSync(path.join(albumPath, 'description.txt'))
      if(!albumDescriptionExists) {
        event.reply('get-album', null);
      }
      let imagesNamesWithExtensions = fs.readdirSync(path.join(albumPath, "images"))
      imagesNamesWithExtensions = imagesNamesWithExtensions != null ? imagesNamesWithExtensions : []
      let imagesNames = [] 
      for (let imageName of imagesNamesWithExtensions) {
        imagesNames.push(imageName.split('.')[0])
      }
      event.reply('get-album', {id: albumId, no: Number(albumId), imagesIds: imagesNames});
    }
  }
});

ipcMain.on('get-album-images', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const contentName = args[0]
 
    const contentPath = createPathToAlbum(rootPath, contentName)
    const imagesMapFilePath = path.join(contentPath, "images_map.json")
    if(fs.existsSync(imagesMapFilePath)) {

      let imagesMapFile = fs.readFileSync(imagesMapFilePath)
      let imagesMap = JSON.parse(imagesMapFile.toString())
      
      imagesMap["images"].forEach((element: any) => {
        element["path"] = "file://" + path.join(contentPath, "images", element.filename)
      });
  
      event.reply('get-album-images', imagesMap["images"])
    }
  }

  // ipcMain.on('is-')

  // const rootPath: string = store.get('dataPath');
  // if (rootPath != null) {
    // const albumId = args[0]
    // if (albumId == null)  event.reply('get-album-images', null);
    // } else {
      // const albumPath = createPathToAlbum(rootPath, albumId);
      // const albumExists = fs.existsSync(albumPath);
      // const pathToImages = path.join(albumPath, "images")
      // if (!albumExists) {
        // event.reply('get-album-images', null);
      // }
      // const albumImagesFolderExists = fs.existsSync(pathToImages);
      // if (!albumImagesFolderExists) {
        // event.reply('get-album-images', null);
      // }
      // const albumTitleExists = fs.existsSync(path.join(albumPath, 'title.txt'))
      // if(!albumTitleExists) {
        // event.reply('get-album-images', null);
      // }
      // const albumDescriptionExists = fs.existsSync(path.join(albumPath, 'description.txt'))
      // if(!albumDescriptionExists) {
        // event.reply('get-album-images', null);
      // }
      // let imagesNames = fs.readdirSync(pathToImages)
      // let imagesPaths: {path: string, id: number}[] = []
      // for (let imageName of imagesNames) {
        // imagesPaths.push({path: `file://${pathToImages}/${imageName}`, id: Number(imageName.split('.')[0])})
      // }
      // imagesPaths = imagesPaths != null ? imagesPaths : [] 
      // event.reply('get-album-images', imagesPaths);
    // }
  // }
});

ipcMain.on('electron-store-get', async (event, val) => {
  event.returnValue = store.get(val);
});

ipcMain.on('electron-store-set', async (event, key, val) => {
  store.set(key, val);
});

ipcMain.on('settings-select-path', async (event, args) => {
  if (mainWindow) {
    const dirPathReturnValue: Electron.OpenDialogReturnValue =
      await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
      });
    let rootPath = dirPathReturnValue.filePaths[0];
    console.log("settings-select-path:", rootPath) 
    console.log("settings-select-path:", doesAlbumFolderExists(rootPath), doesAlbumMapExists(rootPath))
    if(!doesAlbumFolderExists(rootPath) && !doesAlbumMapExists(rootPath)) {
      console.log("does Album")
      const newAlbumIndex = 0;
      const newAlbumId = uuidv4();
      const firstImageId = uuidv4()
      const placeHolderImage = fs.readFileSync("assets/img_placeholder.png");

      const albumPath = createPathToAlbum(rootPath, newAlbumId);
      const imagePath = createPathToImage(rootPath, newAlbumId, firstImageId);
      createPathIfNotExists(albumPath);
      createPathIfNotExists(path.join(albumPath, "images"));
      console.log("createPathIfNotExists")
      fs.writeFileSync(path.join(albumPath, 'title.txt'), '');
      fs.writeFileSync(path.join(albumPath, 'description.txt'), '');
      fs.writeFileSync(path.join(albumPath, "images_map.json"), JSON.stringify({'images':[{'id': firstImageId, "filename": firstImageId + ".png"}]}))
      fs.writeFileSync(imagePath, placeHolderImage)
      
      // let albumsMapFile = fs.readFileSync(path.join(rootPath, "album_map.json"))
      // let albumsMap = JSON.parse([{"id": newAlbumId.toString()}]);
      // albumsMap["albums"].splice(newAlbumIndex, 0, {
      //   "id": newAlbumId
      // })
      
      fs.writeFileSync(path.join(rootPath, "album_map.json"), JSON.stringify({"albums":[{"id": newAlbumId.toString()}]})) 
    }

    console.log('settings-select-path.')
    store.set('dataPath', rootPath);
    event.reply('settings-select-path', rootPath)
  }
  loadFileTree();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};


const doesAlbumMapExists = (dirPath: string) => {
  const albumMapPath = path.join(dirPath, "album_map.json")
  return fs.existsSync(albumMapPath)
}

const doesAlbumFolderExists = (dirPath: string) => {
  const albumFolderPath = path.join(dirPath, "albums")
  return fs.existsSync(albumFolderPath)
}


const loadFileTree = async () => {
  const dataPath: string = store.get('dataPath');
  console.log("loadFileTree:", dataPath)
  if (dataPath != null) {
    if(doesAlbumFolderExists(dataPath) && doesAlbumMapExists(dataPath)) {
      console.log("loadFileTree", "doesAlbumFolderExists", doesAlbumFolderExists(dataPath), "doesAlbumMapExists", doesAlbumMapExists(dataPath))
      const files = fs.readdirSync(dataPath, {});
      store.set('pagesList', files);
    } else {
      store.clear()
      console.log(store.get('rootPath'), "||||", store.get('dataPath'))
    }
  }
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minHeight: 600,
    minWidth: 800,
    maxHeight: 1440,
    maxWidth: 2560,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      webSecurity: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
  loadFileTree();
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
