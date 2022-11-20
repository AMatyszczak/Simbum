import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import './App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from './album_components/DescriptionEditor';
import TitleEditor from './album_components/TitleEditor';
import ImageViewer from './album_components/ImageViewer';

const Simbum = () => {
  return (
    <div className="album-content">
      <TitleEditor />
      <ImageViewer />
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
