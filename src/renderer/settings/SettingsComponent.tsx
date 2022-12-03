import { Link } from 'react-router-dom';
import arrow_left from '../../../assets/icons/arrow_left.svg';
import './SettingsComponent.css';

function SettingsComponent() {
  function selectPath() {
    window.electron.ipcRenderer.sendMessage('settings-select-path', []);
  }

  return (
    <>
      <button type="button" className="return-button">
        <Link to="/">
          <img src={arrow_left} className="return-button-icon" alt="" />
        </Link>
      </button>
      <div className="settings-content">
        <button
          type="button"
          onClick={selectPath}
          className="select-data-source-path-button"
        >
          Wybierz folder
        </button>
      </div>
    </>
  );
}

export default SettingsComponent;
