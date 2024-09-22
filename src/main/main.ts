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
  return path.join(rootPath, "families", familyId, "turns", turnId);
}

function createPathToImage(rootPath: string, familyId: string, turnId:string, imageId: string) {
  return path.join(rootPath, "families", familyId, "turns", turnId, "images", imageId.concat(".png"));
}

ipcMain.on('update-turn-image', async (event, args) => {
  console.log('update-turn-image, args:', args)
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const turnId = args[1];
    const imageId = args[2];
    const file = fs.readFileSync(args[3]);
    console.log('familyId:', familyId, "turnId:", turnId, "imageId:", imageId)
    
    const turnPath = createPathToTurn(rootPath, familyId, turnId);
    console.log("update-turn-image, turnPath:", turnPath)
    const imagePath = createPathToImage(rootPath, familyId, turnId, imageId);

    const imagesMapFile = fs.readFileSync(path.join(turnPath, "images_map.json"))
    const imagesMap = JSON.parse(imagesMapFile.toString()) 
    const index = imagesMap["images"].findIndex((imgJson: {id: string; filename: string }) => imgJson.id == imageId, 0)
    console.log('update-turn-image, index:', index)
    if(index == -1) {
      console.log("page-image-changed added missing image file")
      imagesMap["images"].splice(0, 0, {
        "id": imageId,
        "filename": imageId + ".png"
      })
      fs.writeFileSync(path.join(turnPath, "images_map.json"), JSON.stringify(imagesMap))

    }

    console.log("page-image-changed", rootPath, turnId, imageId)
    fs.writeFileSync(imagePath, file);
  }
});

ipcMain.on('update-turn-name', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[1];
    const turnId = args[2];
    const turnPath = createPathToTurn(rootPath, familyId, turnId);
    createPathIfNotExists(turnPath);
    const value = args[3];
    fs.writeFileSync(`${turnPath}/title.txt`, value);
  }
});

ipcMain.on('page-image-deleted', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const turnId = args[1];
    const imageId = args[2];
    
    const turnPath = createPathToTurn(rootPath, familyId, turnId);
    const imagePath = createPathToImage(rootPath, familyId, turnId, imageId);
    
    const imagesMapFile = fs.readFileSync(path.join(turnPath, "images_map.json"))
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
        fs.writeFileSync(path.join(turnPath, "images_map.json"), JSON.stringify(imagesMap))
      }
    }
  }
});


ipcMain.on('delete-family', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    
    const familyPath = createPathToFamily(rootPath, familyId)
    const pathToFamiliesMap = path.join(rootPath, "families_map.json")
    const familiesMapFile = fs.readFileSync(pathToFamiliesMap)
    const familiesMap = JSON.parse(familiesMapFile.toString())
    const index = familiesMap["families"].findIndex((familyJson: { id: string; filename: string }) => familyJson.id === familyId, 0)

    if (index > -1) {
      familiesMap["families"].splice(index, 1);
      fs.writeFileSync(pathToFamiliesMap, JSON.stringify(familiesMap))
      fs.rmSync(familyPath, { recursive: true, force: true})
    }
  }
  event.reply('delete-family', true)
});


ipcMain.on('delete-turn', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const turnId = args[1];
    
    const familyPath = createPathToFamily(rootPath, familyId)
    const turnPath = createPathToTurn(rootPath, familyId, turnId)

    const pathToTurnsMap = path.join(familyPath, "turns_map.json")
    const turnsMapFile = fs.readFileSync(pathToTurnsMap)
    const turnsMap = JSON.parse(turnsMapFile.toString())
    const index = turnsMap["turns"].findIndex((turnJSON: { id: string; filename: string }) => turnJSON.id === turnId, 0)

    if (index > -1) {
      turnsMap["turns"].splice(index, 1);
      fs.writeFileSync(pathToTurnsMap, JSON.stringify(turnsMap))
      fs.rmSync(turnPath, { recursive: true, force: true})
    }
  }
  event.reply('delete-turn', true)
});

ipcMain.on('add-turn-image', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const turnId = args[1];
    const indexOfImage = args[2];
    console.log('add-turn-image, args', args)
    const file = fs.readFileSync(args[3]);
    
    const imageId = uuidv4()
    const imagePath = createPathToImage(rootPath, familyId, turnId, imageId);
    fs.writeFileSync(imagePath, file);
    
    const turnPath = createPathToTurn(rootPath, familyId, turnId)
    let imagesMapFile = fs.readFileSync(path.join(turnPath, "images_map.json"))
    let imagesMap = JSON.parse(imagesMapFile.toString())
    imagesMap["images"].splice(indexOfImage, 0, {
      "id": imageId,
      "filename": imageId + ".png"
    })

    fs.writeFileSync(path.join(turnPath, "images_map.json"), JSON.stringify(imagesMap))
    
    imagesMap["images"].forEach((element: any) => {
      element["path"] = "file://" + path.join(turnPath, "images", element.filename)
    });

    event.reply('add-turn-image', imagesMap["images"])
  }
});

ipcMain.on('add-turn', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const newTurnName = args[1];
    const argsImagePath = args[2];

    const newTurnId = uuidv4();
    // const firstImageId = uuidv4()
    // const placeHolderImage = fs.readFileSync("assets/img_placeholder.png");

    const familyPath = createPathToFamily(rootPath, familyId);
    const turnPath = createPathToTurn(rootPath, familyId, newTurnId);
    const turnsMapPath = path.join(familyPath, "turns_map.json")
    // const imagePath = createPathToImage(rootPath, familyId, newTurnId, firstImageId);
    createPathIfNotExists(turnPath);
    createPathIfNotExists(path.join(turnPath, "images"))
    // createPathIfNotExists(turnsMapPath);

    // fs.writeFileSync(path.join(turnPath, "turns_map.json"), JSON.stringify({'turns': []}))
    // createPathIfNotExists(path.join(turnPath, "images"));

    const avatarImage = fs.readFileSync(argsImagePath);
    const newTurnAvatarImagePath = path.join(turnPath, 'turnAvatarImage.png') 
    fs.writeFileSync(newTurnAvatarImagePath, avatarImage);

    fs.writeFileSync(path.join(turnPath, 'title.txt'), newTurnName);
    fs.writeFileSync(path.join(turnPath, 'description.txt'), '');
    fs.writeFileSync(path.join(turnPath, "images_map.json"), JSON.stringify({'images':[]}))

    // fs.writeFileSync(path.join(turnPath, "images_map.json"), JSON.stringify({'images':[{'id': firstImageId, "filename": firstImageId + ".png"}]}))
    // fs.writeFileSync(imagePath, placeHolderImage)
    
    
    let turnsMapFile = fs.readFileSync(turnsMapPath)
    let turnsMap = JSON.parse(turnsMapFile.toString())
    turnsMap["turns"].splice(0, 0, {
      "id": newTurnId
    })

    fs.writeFileSync(turnsMapPath, JSON.stringify(turnsMap))    
    event.reply('add-turn', turnsMap["turns"])
  }
})
    
ipcMain.on('turn-description-changed', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0]
    const turnId = args[1];
    const contentPath = createPathToTurn(rootPath, familyId, turnId);
    createPathIfNotExists(contentPath);
    const value = args[2];

    // console.log('turn-description-changed, familyId:', familyId, "turnId:", turnId, "contentPath:", contentPath, "value:", value)    
    fs.writeFileSync(`${contentPath}/description.txt`, value);
  }
});

ipcMain.on('get-turns', async (event, arg) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    let turns = fs.readdirSync(path.join(rootPath, "turns"))
    event.reply('get-turns', turns);
  }
});

ipcMain.on('get-turn-map', async (event, arg) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const turnMapFilePath = path.join(rootPath, "turns_map.json")
    if(fs.existsSync(turnMapFilePath)) {
      let turnMapFile = fs.readFileSync(path.join(rootPath, "turns_map.json"))
      let turnMap = JSON.parse(turnMapFile.toString())
  
      event.reply('get-turn-map', turnMap["turns"])
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

        const imagePath = path.join(familyPath, "familyCoverImage.png")
        familiesGalleryData.push({"id": family['id'], name: familyName, imagePath: imagePath})
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
      fs.writeFileSync(path.join(familyPath, "turns_map.json"), JSON.stringify({"turns": []}))
      
      event.reply('add-family', familiesMap['families'])
    }
  }
})


ipcMain.on('get-turn-gallery-data', async (event, arg) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = arg[0]
    const familyPath = createPathToFamily(rootPath, familyId)
    let turnMapFilePath = path.join(familyPath, "turns_map.json")
    if(fs.existsSync(turnMapFilePath)) {
      let turnMapFile = fs.readFileSync(path.join(familyPath, "turns_map.json"))
      let turnMap = JSON.parse(turnMapFile.toString())
      let turnGalleryData: {turnId: string, turnName: string, imagePath: string}[] = []
      console.log("turnMap:", turnMap)
      turnMap['turns'].forEach((turnId: any) => {
        const turnPath = createPathToTurn(rootPath, familyId, turnId['id'])
        const turnAvatarPath = path.join(turnPath, "turnAvatarImage.png")
        let turnName = fs.readFileSync(path.join(turnPath, "title.txt")).toString();
        
        turnGalleryData.push({turnId: turnId['id'], turnName: turnName, imagePath: turnAvatarPath})
      });
      event.reply('get-turn-gallery-data', turnGalleryData)
    }
  }
})


ipcMain.on('get-turn-name', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const turnId = args[1];
    if (turnId == null) {
      event.reply('get-turn-name',null);  
    } else {
      const contentPath = createPathToTurn(rootPath, familyId, turnId);
      const fileContent = fs.readFileSync(`${contentPath}/title.txt`);
      event.reply('get-turn-name', fileContent.toString());
    }
  }
});

ipcMain.on('get-turn-description', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const turnId = args[1];
    if (turnId == null) {
      event.reply('get-turn-description',null);  
    } else {
      const contentPath = createPathToTurn(rootPath, familyId, turnId);
      const fileContent = fs.readFileSync(`${contentPath}/description.txt`);
      event.reply('get-turn-description', fileContent.toString());
    }
  }
});

ipcMain.on('get-turn-page-image', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0];
    const turnId = args[1];
    const imageId = args[2];
    if (turnId == null || imageId == null) {
      event.reply('get-turn-page-image',null, null);  
    } else {
      const imagePath = createPathToImage(rootPath, familyId, turnId, imageId);
      const fileExists = fs.existsSync(imagePath);
      event.reply(
        'get-turn-page-image',
        fileExists ? `file://${imagePath}` : null
      );
    }
  }
});

ipcMain.on('get-turn', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0]
    const turnId = args[1]
    if (turnId == null) {
      event.reply('get-turn', null);
    } else {
      const turnPath = createPathToTurn(rootPath, familyId, turnId);
      const turnExists = fs.existsSync(turnPath);
      if (!turnExists) {
        event.reply('get-turn', null);
      }
      const turnImagesFolderExists = fs.existsSync(path.join(turnPath, "images"));
      if (!turnImagesFolderExists) {
        event.reply('get-turn', null);
      }
      const turnTitleExists = fs.existsSync(path.join(turnPath, 'title.txt'))
      if(!turnTitleExists) {
        event.reply('get-turn', null);
      }
      const turnDescriptionExists = fs.existsSync(path.join(turnPath, 'description.txt'))
      if(!turnDescriptionExists) {
        event.reply('get-turn', null);
      }
      let imagesNamesWithExtensions = fs.readdirSync(path.join(turnPath, "images"))
      imagesNamesWithExtensions = imagesNamesWithExtensions != null ? imagesNamesWithExtensions : []
      let imagesNames = [] 
      for (let imageName of imagesNamesWithExtensions) {
        imagesNames.push(imageName.split('.')[0])
      }
      const title = fs.readFileSync(path.join(turnPath, 'title.txt'))
      event.reply('get-turn', {id: turnId, title: title, no: Number(turnId), imagesIds: imagesNames});
    }
  }
});

ipcMain.on('get-turn-images', async (event, args) => {
  const rootPath: string = store.get('dataPath');
  if (rootPath != null) {
    const familyId = args[0]
    const turnId = args[1]
 
    const contentPath = createPathToTurn(rootPath, familyId, turnId)
    const imagesMapFilePath = path.join(contentPath, "images_map.json")
    if(fs.existsSync(imagesMapFilePath)) {

      let imagesMapFile = fs.readFileSync(imagesMapFilePath)
      let imagesMap = JSON.parse(imagesMapFile.toString())
      
      imagesMap["images"].forEach((element: any) => {
        element["path"] = "file://" + path.join(contentPath, "images", element.filename)
      });
  
      event.reply('get-turn-images', imagesMap["images"])
    }
  }

  // ipcMain.on('is-')

  // const rootPath: string = store.get('dataPath');
  // if (rootPath != null) {
    // const turnId = args[0]
    // if (turnId == null)  event.reply('get-turn-images', null);
    // } else {
      // const turnPath = createPathToTurn(rootPath, turnId);
      // const turnExists = fs.existsSync(turnPath);
      // const pathToImages = path.join(turnPath, "images")
      // if (!turnExists) {
        // event.reply('get-turn-images', null);
      // }
      // const turnImagesFolderExists = fs.existsSync(pathToImages);
      // if (!turnImagesFolderExists) {
        // event.reply('get-turn-images', null);
      // }
      // const turnTitleExists = fs.existsSync(path.join(turnPath, 'title.txt'))
      // if(!turnTitleExists) {
        // event.reply('get-turn-images', null);
      // }
      // const turnDescriptionExists = fs.existsSync(path.join(turnPath, 'description.txt'))
      // if(!turnDescriptionExists) {
        // event.reply('get-turn-images', null);
      // }
      // let imagesNames = fs.readdirSync(pathToImages)
      // let imagesPaths: {path: string, id: number}[] = []
      // for (let imageName of imagesNames) {
        // imagesPaths.push({path: `file://${pathToImages}/${imageName}`, id: Number(imageName.split('.')[0])})
      // }
      // imagesPaths = imagesPaths != null ? imagesPaths : [] 
      // event.reply('get-turn-images', imagesPaths);
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


const doesTurnMapExists = (dirPath: string) => {
  const turnMapPath = path.join(dirPath, "turns_map.json")
  return fs.existsSync(turnMapPath)
}

const doesTurnFolderExists = (dirPath: string) => {
  const turnFolderPath = path.join(dirPath, "turns")
  return fs.existsSync(turnFolderPath)
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
