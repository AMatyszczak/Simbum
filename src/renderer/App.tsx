import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import './App.css';
import 'react-quill/dist/quill.snow.css';
import { useState } from 'react';
import DescriptionEditor from './album_components/DescriptionEditor';
import TitleEditor from './album_components/TitleEditor';
import ImageViewer from './album_components/ImageViewer';
import SettingsButtonComponent from './settings/SettingsButtonComponent';
import SettingsComponent from './settings/SettingsComponent';

const Simbum = () => {
  const [tree, setTree] = useState({});
  const [pageId, setPageId] = useState('0');

  return (
    <>
      <SettingsButtonComponent />
      <div className="album-content">
        <TitleEditor pageId={pageId} />
        <ImageViewer pageId={pageId} />
        <DescriptionEditor pageId={pageId} />
      </div>
    </>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Simbum />} />
        <Route path="/settings" element={<SettingsComponent />} />
      </Routes>
    </Router>
  );
}
