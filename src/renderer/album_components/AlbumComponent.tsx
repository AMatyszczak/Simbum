import '../App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from '../album_components/DescriptionEditor';
import TitleEditor from '../album_components/TitleEditor';
import ImageViewer from '../album_components/ImageViewer';
import SettingsButtonComponent from '../settings/SettingsButtonComponent';
import React from 'react';


type Album = {
  id: string;
  no: number;
  imagesIds: string[]
}

interface AlbumComponentState {
  albumsList: string[];
  pagesLoaded: boolean;
  pageNo: number;
  pageId: string;
  album: Album;
}

export default class AlbumComponent extends React.Component<
  any,
  AlbumComponentState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      albumsList: [],
      pagesLoaded: false,
      pageNo: 0,
      pageId: '0',
      album: {id: "0", no: 0, imagesIds: []},
    };

    this.onNextAlbumClick = this.onNextAlbumClick.bind(this);
    this.onPrevAlbumClick = this.onPrevAlbumClick.bind(this);
    this.moveToPage = this.moveToPage.bind(this);
    this.isFirstAlbum = this.isFirstAlbum.bind(this);
    this.isLastAlbum = this.isLastAlbum.bind(this);
    this.shouLastAlbum = this.shouLastAlbum.bind(this);
  }

  componentDidMount() {
    this.loadAlbums();
    this.loadAlbum(this.state.album.id);
  }

  loadAlbums() {
    window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
      this.setState({albumsList: arg});
    })
    window.electron.ipcRenderer.sendMessage('get-album-map', []);
  }

  loadAlbum(id: string) {
    window.electron.ipcRenderer.once('get-album', (arg: any) => {
      if (arg == null) {
        this.createNewAlbum(0);
      } else {
        this.setState({album: arg, pagesLoaded: true, pageNo: 0, pageId: "0"});
      }
    });
    window.electron.ipcRenderer.sendMessage('get-album', [
      id,
    ]);  
  }

  onNextAlbumClick() {
    if (this.isLastAlbum()) {
      this.createNewAlbum(this.state.album.no + 1);
    } else {
      this.moveToAlbum(String(this.state.album.no + 1));
    }
  }

  onPrevAlbumClick() {
    this.moveToAlbum(String(this.state.album.no - 1));
  }

  moveToAlbum(albumId: string) {
    this.loadAlbum(albumId)
  }

  moveToPage(pageId: number) {
    const pageNo = this.state.album.imagesIds.findIndex((e: any) => e == pageId.toString())
    if(pageNo != -1) {
      this.setState({
        pageId: this.state.album.imagesIds[pageNo],
        pageNo: pageNo,
      });
    }
  }

  createNewAlbum(albumNo: number) {
    window.electron.ipcRenderer.once('create-album', (arg: any) => {
      this.setState({ album: {id: String(albumNo), no: albumNo, imagesIds: []}, pageNo: albumNo });
    });
    window.electron.ipcRenderer.sendMessage('create-album', [albumNo]);
  }

  private isFirstAlbum(): boolean {
    return false
  }

  private isLastAlbum(): boolean {
    return this.state.albumsList.length - 1 == this.state.album.no
  }

  private shouLastAlbum(): boolean {
    return this.state.albumsList.length == this.state.album.no
  }

  render() {
    if (!this.state.pagesLoaded) {return <div className='loader'/>}
    else
      return (
        <>
          <SettingsButtonComponent />
          <div className="album-content">
            <TitleEditor albumId={this.state.album.id} />
            <ImageViewer
              albumId={this.state.album.id}
              pagesList={this.state.album.imagesIds}
              pageId={this.state.pageId}
              onNextAlbumClick={this.onNextAlbumClick}
              onPrevAlbumClick={this.onPrevAlbumClick}
              moveToPage={this.moveToPage}
              shouldDisableNextButton={this.shouLastAlbum}
              shouldDisablePrevButton={this.isFirstAlbum}
            />
            <DescriptionEditor albumId={this.state.album.id} />
          </div>
        </>
      );
    }
}
