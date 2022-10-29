import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import button_left from '../../assets/buttons/button_left.png';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
import button_right from '../../assets/buttons/button_right.png';
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import placeholder from '../../assets/img_placeholder.png';
import './App.css';

const Simbum = () => {
  return (
    <div className="Content">
      <input className="ImageTitle" type="text" value="Przyjaciele" />
      <div className="ImageSwitcher">
        <button className="PreviousImageButton" type="button">
          <img src={button_left} className="Image" alt="" />
        </button>
        <img
          id="dropped_image"
          draggable="false"
          className="Image"
          src={placeholder}
          alt=""
        />
        <button className="NextImageButton" type="button">
          <img src={button_right} className="Image" alt="" />
        </button>
      </div>
      <div className="ImageDescriptionBox">
        <div className="ScrollbarBox">
          <span className="ImageDescriptionText" role="textbox">
            bla bla
          </span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Simbum />} />
      </Routes>
    </Router>
  );
}
