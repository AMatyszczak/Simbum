import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import 'react-quill/dist/quill.snow.css';
import SettingsComponent from './settings/SettingsComponent';
import React from 'react';
import AlbumComponent from './album_components/AlbumComponent';
import LoadingComponent from './loading_component/LoadingComponent';
import AlbumGalleryComponent from './album_components/FamilyGalleryComponent';
import FamilyGalleryComponent from './album_components/FamilyGalleryComponent';
import AlbumGallery from './album_components/AlbumGallery';

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
    console.log("isComponentMounted:", this.state.isComponentMounted, "isDataPath:", this.state.isDataPath, "dataPath:", window.electron.store.get('dataPath'))
    this.setState({ isComponentMounted: true, isDataPath: isDataPath });
  }

  render() {
  
    console.log("App.tsx render()")
  
    console.log("App.tsx:", this.state)
    if (!this.state.isDataPath) {
      console.log("App.tsx, render returns SettingsComponent")
      return <SettingsComponent isPathToUserFilesSet={this.state.isDataPath}/>;
    }
    if (!this.state.isComponentMounted) {
      console.log("App.tsx, render returns LoadingComponent")
      return <LoadingComponent />;
    }
   
    console.log("App.tsx, render returns FamilyGalleryComponent")
    return <FamilyGalleryComponent />
  }
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Simbum />} />
        <Route path="/familyGallery" element={<FamilyGalleryComponent />} />
        <Route path="/album" element={<AlbumComponent />} />
        <Route path="/albumGallery" element={<AlbumGallery />} />
        <Route path="/settings" element={<SettingsComponent isPathToUserFilesSet={false}/>} />
      </Routes>
    </Router>
  );
}
