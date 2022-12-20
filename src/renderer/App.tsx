import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import './App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from './album_components/DescriptionEditor';
import TitleEditor from './album_components/TitleEditor';
import ImageViewer from './album_components/ImageViewer';
import SettingsButtonComponent from './settings/SettingsButtonComponent';
import SettingsComponent from './settings/SettingsComponent';
import React from 'react';

interface SimBumState {
  pagesList: string[];
  pageId: string;
}

class Simbum extends React.Component<any, SimBumState> {
  constructor(props: any) {
    super(props);
    this.state = {
      pagesList: [],
      pageId: '0',
    };

    this.onNextPageClick = this.onNextPageClick.bind(this);
    this.onPrevPageClick = this.onPrevPageClick.bind(this);
  }

  componentDidUpdate() {}

  componentDidMount() {
    this.loadFileList();
    this.loadFirstPage();
  }

  loadFileList() {
    this.setState({ pagesList: window.electron.store.get('pagesList') }, () => {
      this.loadFirstPage();
    });
  }

  loadFirstPage() {
    this.setState({ pageId: this.state.pagesList[0] });
  }

  onNextPageClick() {
    const nextPage = parseInt(this.state.pageId) + 1;
    this.setState({ pageId: nextPage.toString() });
  }

  onPrevPageClick() {
    const prevPage = parseInt(this.state.pageId) - 1;
    this.setState({ pageId: prevPage.toString() });
  }

  render() {
    return (
      <>
        <SettingsButtonComponent />
        <div className="album-content">
          <TitleEditor pageId={this.state.pageId} />
          <ImageViewer
            pageId={this.state.pageId}
            onNextPageClick={this.onNextPageClick}
            onPrevPageClick={this.onPrevPageClick}
          />
          <DescriptionEditor pageId={this.state.pageId} />
        </div>
      </>
    );
  }
}

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
