import { Link } from 'react-router-dom';
import settings_icon from '../../../assets/buttons/settings.svg';
import trash_icon from '../../../assets/buttons/trash.svg';
import React from 'react';


interface ToolbarComponentProps {
  onTrashClick: any
}


export default class SettingsButtonComponent extends React.Component <ToolbarComponentProps, any> {

  constructor(props: ToolbarComponentProps) {
    super(props);

  }


  render () {
    return (
      <div className="album-toolbar">
        <button type="button" className="button">
          <Link to="/settings">
            <img src={settings_icon} className="settings-icon" alt="" />
          </Link>
        </button>
        <button type="button" className="button" onClick={this.props.onTrashClick}>
          <img src={trash_icon} className="settings-icon" alt=""/>
        </button>
        <Link to="/familyGallery">Gallery</Link>
      </div>
    );
  }
}

