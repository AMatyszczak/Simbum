import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'react-quill/dist/quill.snow.css';
import SettingsComponent from './settings/SettingsComponent';
import React from 'react';
import AlbumComponent from './album_components/AlbumComponent';
import LoadingComponent from './loading_component/LoadingComponent';

interface SimbumState {
  isComponentMounted: boolean;
  isDataPath: boolean;
}
class Simbum extends React.Component<any, SimbumState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isComponentMounted: false,
      isDataPath: false,
    };
  }

  componentDidMount(): void {
    const isDataPath = window.electron.store.get('dataPath') != null;
    this.setState({ isComponentMounted: true, isDataPath: isDataPath });
  }

  render() {
    if (!this.state.isComponentMounted) {
      return <LoadingComponent />;
    }
    if (!this.state.isDataPath) {
      return <SettingsComponent isPathToUserFilesSet={this.state.isDataPath}/>;
    }
    return <AlbumComponent />;
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Simbum />} />
        <Route path="/album" element={<AlbumComponent />} />
        <Route path="/settings" element={<SettingsComponent isPathToUserFilesSet={false}/>} />
      </Routes>
    </Router>
  );
}
