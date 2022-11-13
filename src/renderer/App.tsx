import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import './App.css';
import { useState } from 'react';
import ReactQuill from 'react-quill';
import button_right from '../../assets/buttons/button_right.png';
import button_left from '../../assets/buttons/button_left.png';
import placeholder from '../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';

function DescriptionEditor() {
  const [value, setValue] = useState('');

  const modules = {
    toolbar: false,
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
  ];

  return (
    <div className="album-image-description-container">
      <div className="album-image-description-scrollbar">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          modules={modules}
          formats={formats}
          className="album-image-description-content"
        />
      </div>
    </div>
  );
}

const Simbum = () => {
  return (
    <div className="album-content">
      <input
        className="album-title-content"
        type="text"
        defaultValue="Przyjaciele"
        spellCheck="false"
      />
      <div className="album-images-controller">
        <button className="previous-album-image-button" type="button">
          <img src={button_left} className="button-image" alt="" />
        </button>
        <div className="album-image-container">
          <img
            id="dropped_image"
            draggable="false"
            className="album-image"
            src={placeholder}
            alt=""
          />
        </div>
        <button className="next-album-image-button" type="button">
          <img src={button_right} className="button-image" alt="" />
        </button>
      </div>

      <DescriptionEditor />
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
