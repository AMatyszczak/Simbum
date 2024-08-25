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

function createPathToFamily(rootPath: string, familyId: string) {
  return path.join(rootPath, "families", familyId);
}

function createPathToTurn(rootPath: string, familyId: string, turnId: string) {
  return path.join(rootPath, "families", familyId, "albums", turnId);
}

function createPathToImage(rootPath: string, familyId: string, albumId:string, imageId: string) {
  return path.join(rootPath, "families", familyId, "albums", albumId, "images", imageId.concat(".png"));
}

ipcMain.on('page-image-changed', async (event, args) => {
  console.log("page-image-changed")
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const albumId = args[1];
    const imageId = args[2];
    const file = fs.readFileSync(args[2]);

    const albumPath = createPathToTurn(rootPath, familyId, albumId);
    const imagePath = createPathToImage(rootPath, familyId, albumId, imageId);

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
    const familyId = args[1];
    const albumId = args[2];
    const albumPath = createPathToTurn(rootPath, familyId, albumId);
    createPathIfNotExists(albumPath);
    const value = args[3];
    fs.writeFileSync(`${albumPath}/title.txt`, value);
  }
});

ipcMain.on('page-image-deleted', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const albumId = args[1];
    const imageId = args[2];
    
    const albumPath = createPathToTurn(rootPath, familyId, albumId);
    const imagePath = createPathToImage(rootPath, familyId, albumId, imageId);
    
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
    const familyId = args[0];
    const albumId = args[1];
    const indexOfImage = args[2];
    const file = fs.readFileSync(args[3]);
    
    const imageId = uuidv4()
    const imagePath = createPathToImage(rootPath, familyId, albumId, imageId);
    fs.writeFileSync(imagePath, file);
    
    const albumPath = createPathToTurn(rootPath, familyId, albumId)
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

ipcMain.on('add-turn', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const newTurnName = args[1];
    const argsImagePath = args[2];

    const newAlbumId = uuidv4();
    // const firstImageId = uuidv4()
    // const placeHolderImage = fs.readFileSync("assets/img_placeholder.png");

    const familyPath = createPathToFamily(rootPath, familyId);
    const turnPath = createPathToTurn(rootPath, familyId, newAlbumId);
    const albumsMapPath = path.join(familyPath, "albums_map.json")
    // const imagePath = createPathToImage(rootPath, familyId, newAlbumId, firstImageId);
    createPathIfNotExists(turnPath);
    // createPathIfNotExists(albumsMapPath);

    // fs.writeFileSync(path.join(turnPath, "albums_map.json"), JSON.stringify({'albums': []}))
    // createPathIfNotExists(path.join(turnPath, "images"));

    const avatarImage = fs.readFileSync(argsImagePath);
    const newAlbumAvatarImagePath = path.join(turnPath, 'turnAvatarImage.png') 
    fs.writeFileSync(newAlbumAvatarImagePath, avatarImage);

    fs.writeFileSync(path.join(turnPath, 'title.txt'), newTurnName);
    fs.writeFileSync(path.join(turnPath, 'description.txt'), '');
    fs.writeFileSync(path.join(turnPath, "images_map.json"), JSON.stringify({'images':[]}))

    // fs.writeFileSync(path.join(turnPath, "images_map.json"), JSON.stringify({'images':[{'id': firstImageId, "filename": firstImageId + ".png"}]}))
    // fs.writeFileSync(imagePath, placeHolderImage)
    
    
    let albumsMapFile = fs.readFileSync(albumsMapPath)
    let albumsMap = JSON.parse(albumsMapFile.toString())
    albumsMap["albums"].splice(0, 0, {
      "id": newAlbumId
    })

    fs.writeFileSync(albumsMapPath, JSON.stringify(albumsMap))    
    event.reply('add-turn', albumsMap["albums"])
  }
})
    
ipcMain.on('album-description-changed', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[1]
    const albumId = args[2];
    const contentPath = createPathToTurn(rootPath, familyId, albumId);
    createPathIfNotExists(contentPath);
    const value = args[3];

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
    const albumMapFilePath = path.join(rootPath, "albums_map.json")
    if(fs.existsSync(albumMapFilePath)) {
      let albumMapFile = fs.readFileSync(path.join(rootPath, "albums_map.json"))
      let albumMap = JSON.parse(albumMapFile.toString())
  
      event.reply('get-album-map', albumMap["albums"])
    }
  }
})


ipcMain.on('get-family-gallery-data', async (event, arg) => {
  const rootPath: string = store.get('dataPath');
  console.log('get-family-gallery-data start, rootPath:', rootPath)
  if(rootPath != null) {
    const familiesMapFilePath = path.join(rootPath, "families_map.json")
    if(fs.existsSync(familiesMapFilePath)) {
      let familiesMapFile = fs.readFileSync(path.join(rootPath, "families_map.json"))
      let familiesMap = JSON.parse(familiesMapFile.toString())
      let familiesGalleryData: {id: string, name: string, imagePath: string}[] = []
      familiesMap['families'].forEach((family: any) => {
        let familyPath = createPathToFamily(rootPath, family['id'])
        let familyName = family['name']

        // const albumsMapFile = fs.readFileSync(path.join(familyPath, "albums_map.json"))
        // const albumsMap = JSON.parse(albumsMapFile.toString())
        // if(albumsMap['albums'].length <= 0) {
          // familiesGalleryData.push({"id": family['id'], name: familyName, imagePath: "/home/adrian/Desktop/d6078377-4435-4820-b1ec-ba0266701a96.jpeg"})
        // } else {
          // const albumId = albumsMap["albums"][0]['id']
  
          // const albumPath = createPathToAlbum(rootPath, family, albumId)
          // let imagesMapFile = fs.readFileSync(path.join(albumPath, "images_map.json"));
          // let imagesMap = JSON.parse(imagesMapFile.toString())
          // let imageId = imagesMap["images"][0]['id']
          // let imagePath = createPathToImage(rootPath, family, albumId['id'], imageId)}

          const imagePath = path.join(familyPath, "familyCoverImage.png")
          familiesGalleryData.push({"id": family['id'], name: familyName, imagePath: imagePath})
        // } 
      });
      event.reply('get-family-gallery-data', familiesGalleryData)
    }
  }
}) 


ipcMain.on('add-family', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if(rootPath != null) {
    const familiesMapFilePath = path.join(rootPath, "families_map.json")
    if(fs.existsSync(familiesMapFilePath)) {
      
      var argsImagePath = args[0]
      var argsFamilyName = args[1]
      var argsFamilyIndex = args[2]

      const newFamilyId = uuidv4();
      const newFamilyIndex = argsFamilyIndex
      const newFamilyPath = createPathToFamily(rootPath, newFamilyId);
      createPathIfNotExists(newFamilyPath);
      
      const placeHolderImage = fs.readFileSync("assets/img_placeholder.png");
      const avatarImage = fs.readFileSync(argsImagePath);
      const newFamilyAvatarImagePath = path.join(newFamilyPath, 'familyCoverImage.png') 
      fs.writeFileSync(newFamilyAvatarImagePath, avatarImage);

      let familiesMapFile = fs.readFileSync(path.join(rootPath, "families_map.json"))
      let familiesMap = JSON.parse(familiesMapFile.toString())
      familiesMap["families"].splice(newFamilyIndex, 0, {
        "id": newFamilyId,
        "name": argsFamilyName
      })

      fs.writeFileSync(path.join(rootPath, "families_map.json"), JSON.stringify(familiesMap))
      
      const familyPath = createPathToFamily(rootPath, newFamilyId)
      fs.writeFileSync(path.join(familyPath, "albums_map.json"), JSON.stringify({"albums": []}))
      
      event.reply('add-family', familiesMap['families'])

      
      // familiesMap['families'].forEach((familyId: any) => {
      //   let familyPath = createPathToFamily(rootPath, familyId['id'])
      //   let familyTitle = "Family title placeholder"

      //   const albumsMapFile = fs.readFileSync(path.join(familyPath, "albums_map.json"))
      //   const albumsMap = JSON.parse(albumsMapFile.toString())
      //   if(albumsMap['albums'].length <= 0) {
      //     familiesGalleryData.push({"id": familyId['id'], title: familyTitle, imagePath: "/home/adrian/Desktop/d6078377-4435-4820-b1ec-ba0266701a96.jpeg"})
      //   } else {
      //     const albumId = albumsMap["albums"][0]['id']
  
      //     const albumPath = createPathToAlbum(rootPath, familyId, albumId)
      //     let imagesMapFile = fs.readFileSync(path.join(albumPath, "images_map.json"));
      //     let imagesMap = JSON.parse(imagesMapFile.toString())
      //     let imageId = imagesMap["images"][0]['id']
      
      //     familiesGalleryData.push({"id": familyId['id'], title: familyTitle, imagePath: createPathToImage(rootPath, familyId, albumId['id'], imageId)})
      //   } 
      // });
      // console.log("reply to get-family-gallery-data:", familiesGalleryData)
      // event.reply('add-new-family', familiesGalleryData)
    }
  }
})


ipcMain.on('get-turn-gallery-data', async (event, arg) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = arg[0]
    const familyPath = createPathToFamily(rootPath, familyId)
    let albumMapFilePath = path.join(familyPath, "albums_map.json")
    if(fs.existsSync(albumMapFilePath)) {
      let turnMapFile = fs.readFileSync(path.join(familyPath, "albums_map.json"))
      let turnMap = JSON.parse(turnMapFile.toString())
      let turnGalleryData: {turnId: string, turnName: string, imagePath: string}[] = []
      console.log("turnMap:", turnMap)
      turnMap['albums'].forEach((turnId: any) => {
        const turnPath = createPathToTurn(rootPath, familyId, turnId['id'])
        const turnAvatarPath = path.join(turnPath, "turnAvatarImage.png")
        // let imagesMapFile = fs.readFileSync(path.join(albumPath, "images_map.json"));
        // let imagesMap = JSON.parse(imagesMapFile.toString())
        // let imageId = imagesMap["images"][0]['id']
        let turnName = fs.readFileSync(path.join(turnPath, "title.txt")).toString();
        // let turnDescription = fs.readFileSync(path.join(turnPath, "description.txt")).toString();
        // let turnAvatarImage = fs.readFileSync(path.join(albumPath, "turnAvatarImage.png")).toString();
        
        turnGalleryData.push({turnId: turnId['id'], turnName: turnName, imagePath: turnAvatarPath})
      });
      event.reply('get-turn-gallery-data', turnGalleryData)
    }
  }
})


ipcMain.on('get-album-title', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const albumId = args[1];
    if (albumId == null) {
      event.reply('get-album-title',null);  
    } else {
      const contentPath = createPathToTurn(rootPath, familyId, albumId);
      const fileContent = fs.readFileSync(`${contentPath}/title.txt`);
      event.reply('get-album-title', fileContent.toString());
    }
  }
});

ipcMain.on('get-album-description', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const albumId = args[1];
    if (albumId == null) {
      event.reply('get-album-description',null);  
    } else {
      const contentPath = createPathToTurn(rootPath, familyId, albumId);
      const fileContent = fs.readFileSync(`${contentPath}/description.txt`);
      event.reply('get-album-description', fileContent.toString());
    }
  }
});

ipcMain.on('get-album-page-image', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const albumId = args[1];
    const imageId = args[2];
    if (albumId == null || imageId == null) {
      event.reply('get-album-page-image',null, null);  
    } else {
      const imagePath = createPathToImage(rootPath, familyId, albumId, imageId);
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
    const familyId = args[0]
    const albumId = args[1]
    if (albumId == null) {
      event.reply('get-album', null);
    } else {
      const albumPath = createPathToTurn(rootPath, familyId, albumId);
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
    const familyId = args[0]
    const albumId = args[1]
 
    const contentPath = createPathToTurn(rootPath, familyId, albumId)
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
  
    console.log("settings-select-path does:", doesFamilyFolderExists(rootPath), doesFamilyMapExists(rootPath))
    if(!doesFamilyFolderExists(rootPath) && !doesFamilyMapExists(rootPath)) {
      createPathIfNotExists(path.join(rootPath, "families"))
      fs.writeFileSync(path.join(rootPath, "families_map.json"), JSON.stringify({"families":[]}))
    }
    
    console.log("finished settings select path, dataPath:", rootPath) 
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
  const albumMapPath = path.join(dirPath, "albums_map.json")
  return fs.existsSync(albumMapPath)
}

const doesAlbumFolderExists = (dirPath: string) => {
  const albumFolderPath = path.join(dirPath, "albums")
  return fs.existsSync(albumFolderPath)
}

const doesFamilyMapExists = (dirPath: string) => {
  const familyMapPath = path.join(dirPath, "families_map.json")
  return fs.existsSync(familyMapPath)
}

const doesFamilyFolderExists = (dirPath: string) => {
  const familyFolderPath = path.join(dirPath, "families")
  return fs.existsSync(familyFolderPath)
}


const loadFileTree = async () => {
  const dataPath: string = store.get('dataPath');
  console.log("loadFileTree:", dataPath)
  if (dataPath != null) {
    if(doesFamilyFolderExists(dataPath) && doesFamilyMapExists(dataPath)) {
      console.log("loadFileTree", "doesFamilyFolderExists", doesFamilyFolderExists(dataPath), "doesFamilyMapExists", doesFamilyMapExists(dataPath))
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
