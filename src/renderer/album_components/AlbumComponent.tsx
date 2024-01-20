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
    window.electron.ipcRenderer.once('get-albums', (arg: any) => {
      console.log(`loadAlbums___ : ${arg}`)
      this.setState({albumsList: arg});
    });
    window.electron.ipcRenderer.sendMessage('get-albums', []);  
  }

  loadAlbum(id: string) {
    window.electron.ipcRenderer.once('get-album', (arg: any) => {
      if (arg == null) {
        this.createNewAlbum(0);
      } else {
        console.log(`id: ${arg.id}`)
        console.log(`no: ${arg.no}`)
        console.log(`images: ${arg.imagesIds}`)
        this.setState({album: arg, pagesLoaded: true, pageNo: 0, pageId: "0"});
      }
    });
    window.electron.ipcRenderer.sendMessage('get-album', [
      id,
    ]);  
  }

  onNextAlbumClick() {
    console.log(`onNextAlbumClick, this.isLastAlbum(): ${this.isLastAlbum()}` )
    if (this.isLastAlbum()) {
      this.createNewAlbum(this.state.album.no + 1);
    } else {
      console.log(typeof this.state.album.no)
      console.log(`____ ${String()}`)
      this.moveToAlbum(String(this.state.album.no + 1));
    }
  }

  onPrevAlbumClick() {
    this.moveToAlbum(String(this.state.album.no - 1));
  }

  moveToAlbum(albumId: string) {
    console.log(`moveToAlbum: ${albumId}`)
    this.loadAlbum(albumId)
    // this.setState({
    //   album: {id: albumId, no: Number(albumId), imagesIds: [] }
    // });
  }

  moveToPage(pageNo: number) {
    console.log(`___ pageNo moveToPage ${pageNo}, pageId: ${this.state.album.imagesIds[pageNo]}`)
    this.setState({
      pageId: this.state.album.imagesIds[pageNo],
      pageNo: pageNo,
    });
  }

  createNewAlbum(albumNo: number) {
    window.electron.ipcRenderer.once('create-new-album', (arg: any) => {
      this.setState({ album: {id: String(albumNo), no: albumNo, imagesIds: []}, pageNo: albumNo });
    });
    window.electron.ipcRenderer.sendMessage('create-new-album', [albumNo]);
  }

  private isFirstAlbum(): boolean {
    console.log(`_____isFirstAlbum ${this.state.album.no}`)
    return false
  }

  private isLastAlbum(): boolean {
    console.log(`______isLastAlbum this.state.albumsList.length:, ${this.state.albumsList.length}, ${this.state.album.no}`)
    return this.state.albumsList.length - 1 == this.state.album.no
  }

  private shouLastAlbum(): boolean {
    console.log(`______isLastAlbum this.state.albumsList.length:, ${this.state.albumsList.length}, ${this.state.album.no}`)
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
