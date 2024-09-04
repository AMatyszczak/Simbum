import { Link, Navigate, useNavigate } from 'react-router-dom';
import arrow_left from '../../../assets/buttons/arrow_left.svg';
import './SettingsComponent.css';
import { useEffect, useState } from 'react';

interface SettingsComponentState {
  pathToUserFiles: string;
  newPathSet: boolean;
}

interface SettingsComponentProps {
  isPathToUserFilesSet: boolean;
}


export default function SettingsComponent(props: SettingsComponentProps) {
  
  const navigate = useNavigate()
  const [pathToUserFiles, setPathToUserFiles] = useState("")
  const [newPathSet, setNewPath] = useState(false)

  useEffect(() => {
      setPathToUserFiles(window.electron.store.get('dataPath'))
  }, [])
  
  function selectPath() {
    window.electron.ipcRenderer.once('settings-select-path', (arg: any) => {
      console.log("selectPath once event:", arg)
      setPathToUserFiles(arg)
      setNewPath(true)
    });
    window.electron.ipcRenderer.sendMessage('settings-select-path', []);
  }

  function isPathToDataSet() {
    console.log("props:", props, "props.isPathToUserFilesSet", props.isPathToUserFilesSet, "pathToUserFiles:", pathToUserFiles)
    return props.isPathToUserFilesSet || pathToUserFiles
  }

  const handleReturnToPreviousPage = () => navigate(-1)

  if(newPathSet) { return <Navigate to="/familyGallery"/> }
  else return(
          <>
            <button type="button" className="return-button">
              {
                isPathToDataSet() ?
                    <img src={arrow_left} alt="" onClick={handleReturnToPreviousPage}/>
                    : <img src={arrow_left} className="return-button-icon-gray disabled" alt="" />
              }
            </button>
            <div className="settings-content">
            Wybierz miejsce, gdzie będą zapisywane twoje dane
              <button
                type="button"
                onClick={selectPath}
                className="select-data-source-path-button"
                >
                Wybierz folder
              </button>
            </div>
            {
              pathToUserFiles ? <span>Obecnie jest to: {pathToUserFiles}</span> : ""
            }
            
          </>
          );
        }