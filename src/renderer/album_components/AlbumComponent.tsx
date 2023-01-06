import '../App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from '../album_components/DescriptionEditor';
import TitleEditor from '../album_components/TitleEditor';
import ImageViewer from '../album_components/ImageViewer';
import SettingsButtonComponent from '../settings/SettingsButtonComponent';
import React from 'react';

interface AlbumComponentState {
  pagesList: string[];
  pageNo: number;
  pageId: string;
}

export default class AlbumComponent extends React.Component<
  any,
  AlbumComponentState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      pagesList: [],
      pageNo: 0,
      pageId: '0',
    };

    this.onNextPageClick = this.onNextPageClick.bind(this);
    this.onPrevPageClick = this.onPrevPageClick.bind(this);
  }

  componentDidMount() {
    this.loadFileList();
  }

  loadFileList() {
    const storedPages = window.electron.store.get('pagesList');
    if (storedPages == null) {
      console.log('storedPages are null');
    } else {
      this.setState({ pagesList: storedPages }, () => {
        this.loadFirstPage();
      });
    }
  }

  loadFirstPage() {
    this.setState({
      pageId: this.state.pagesList[this.state.pageNo],
    });
  }

  onNextPageClick() {
    if (
      this.state.pageId ===
      this.state.pagesList[this.state.pagesList.length - 1]
    ) {
      this.createNewPage(this.state.pageNo + 1);
    } else {
      this.moveToPage(this.state.pageNo + 1);
    }
  }

  onPrevPageClick() {
    this.moveToPage(this.state.pageNo - 1);
  }

  moveToPage(pageNo: number) {
    this.setState({
      pageId: this.state.pagesList[pageNo],
      pageNo: pageNo,
    });
  }

  createNewPage(pageNo: number) {
    window.electron.ipcRenderer.once('page-created', (arg: any) => {
      this.state.pagesList.push(arg);
      this.setState({ pageId: this.state.pagesList[pageNo], pageNo: pageNo });
    });
    window.electron.ipcRenderer.sendMessage('page-created', [pageNo]);
  }

  render() {
    return (
      <>
        <SettingsButtonComponent />
        <div className="album-content">
          <TitleEditor pageId={this.state.pageId} />
          <ImageViewer
            pagesList={this.state.pagesList}
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
