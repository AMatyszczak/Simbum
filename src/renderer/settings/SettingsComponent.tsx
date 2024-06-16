import { Link, Navigate } from 'react-router-dom';
import arrow_left from '../../../assets/buttons/arrow_left.svg';
import './SettingsComponent.css';
import React from 'react';

interface SettingsComponentState {
  pathToUserFiles: string;
  newPathSet: boolean;
}

interface SettingsComponentProps {
  isPathToUserFilesSet: boolean;
}


class SettingsComponent extends React.Component<SettingsComponentProps, SettingsComponentState> {
  constructor(props: SettingsComponentProps) {
    super(props);
    
    this.state = {
      pathToUserFiles: window.electron.store.get('dataPath'),
      newPathSet: false,
    };
  }


  selectPath = () => {
    window.electron.ipcRenderer.once('settings-select-path', (arg: any) => {
      console.log("selectPath once event:", arg)
      this.setState({ pathToUserFiles: arg, newPathSet: true});
    });
    window.electron.ipcRenderer.sendMessage('settings-select-path', []);
  }

  isPathToDataSet() {
    console.log("iisPathToDataSet:", this.props)
    return this.props.isPathToUserFilesSet || this.state.pathToUserFiles
  }

  render() {
      if(this.state.newPathSet) { return <Navigate to="/album"/> }
        else {
          return (
            <>
            <button type="button" className="return-button">
              {
                this.isPathToDataSet() ?
                  <Link to="/album">
                    <img src={arrow_left} alt="" />
                  </Link>:
                    <img src={arrow_left} className="return-button-icon-gray disabled" alt="" />
              }
            </button>
            <div className="settings-content">
            Wybierz miejsce, gdzie będą zapisywane twoje dane
              <button
                type="button"
                onClick={this.selectPath}
                className="select-data-source-path-button"
                >
                Wybierz folder
              </button>
            </div>
            {
              this.state.pathToUserFiles ? <span>Obecnie jest to: {this.state.pathToUserFiles}</span> : ""
            }
            
          </>
          );
        }
  }
}

export default SettingsComponent;