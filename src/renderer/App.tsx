import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import button_left from '../../assets/buttons/button_left.png';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
import button_right from '../../assets/buttons/button_right.png';
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import placeholder from '../../assets/img_placeholder.png';
import './App.css';

const Simbum = () => {
  return (
    <div className="album-content">
        <input className="album-title" type="text" value="Przyjaciele" />
        <div className="album-images-controller">
            <button className="previous-album-image-button" type="button">
              <img src={button_left} className="button-image" alt="" />
            </button>
          
            <img
              id="dropped_image"
              draggable="false"
              className="album-image"
              src={placeholder}
              alt=""
            /> 
          
            <button className="next-album-image-button" type="button">
              <img src={button_right} className="button-image" alt="" />
            </button>

        </div>

        <div className="album-image-description-container">
          <div className="album-image-description-scrollbar">
            <span className="album-image-description-content" role="textbox">
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
