import { Link } from 'react-router-dom';
import settings_icon from '../../../assets/icons/settings.svg';

function SettingsButtonComponent() {
  return (
    <button type="button" className="settings-button">
      <Link to="/settings">
        <img src={settings_icon} className="settings-icon" alt="" />
      </Link>
    </button>
  );
}

export default SettingsButtonComponent;
