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
  albumsList: {id: string}[];
  albumNo: number;
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
      albumNo: 0,
      pagesLoaded: false,
      pageNo: 0,
      pageId: '0',
      album: {id: "0", no: 0, imagesIds: []},
    };

    this.onNextAlbumClick = this.onNextAlbumClick.bind(this);
    this.onPrevAlbumClick = this.onPrevAlbumClick.bind(this);
    this.isLastAlbumDisplayed = this.isLastAlbumDisplayed.bind(this);
    this.isFirstAlbumDisplayed = this.isFirstAlbumDisplayed.bind(this);
  }

  componentDidMount() {
    this.loadAlbums();
    // this.loadAlbumByIndex(0);
  }

  loadAlbums() {
    console.log("loadAlbums")
    window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
      console.log('get-album-map', arg)
      this.setState({albumsList: arg});
      console.log("before loadAlbum", this.state.albumsList)
      this.loadAlbumById(arg[0].id)
    })
    window.electron.ipcRenderer.sendMessage('get-album-map', []);
  }

  loadAlbumById(id: number) {
    console.log("loadAlbumById", id, this.state.albumsList)
    window.electron.ipcRenderer.once('get-album', (arg: any) => {
      console.log('get-album', arg)  
      this.setState({album: arg, pagesLoaded: true, pageNo: 0, albumNo: 0});
    });
    window.electron.ipcRenderer.sendMessage('get-album', [id]);  
  }

  loadAlbumByIndex(index: number) {
    console.log("loadAlbumByIndex", index, this.state.albumsList, this.state.albumsList[index])
    window.electron.ipcRenderer.once('get-album', (arg: any) => {
      console.log('get-album', arg)  
      this.setState({album: arg, pagesLoaded: true, pageNo: 0, albumNo: index});
    });
    window.electron.ipcRenderer.sendMessage('get-album', [
      this.state.albumsList[index].id,
    ]);  
  }

  onNextAlbumClick() {
    console.log("onNextAlbumClick", this.state.albumNo)
    if (this.isLastAlbumDisplayed()) {
      this.createNewAlbum(this.state.albumNo + 1);
    } else {
      this.moveToAlbum(this.state.albumNo + 1);
    }
  }

  onPrevAlbumClick() {
    console.log("onPrevAlbumClick", this.state.albumNo)
    if (this.isFirstAlbumDisplayed()) {
      this.createNewAlbum(this.state.albumNo - 1);
    } else {
      this.moveToAlbum(this.state.albumNo - 1);
    }
  }

  moveToAlbum(albumNo: number) {
    this.loadAlbumByIndex(albumNo)
  }

  createNewAlbum(index: number) {
    console.log("createNewAlbum")
    window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
      console.log("createNewAlbum get-album-map:", arg)
      this.setState({albumsList: arg});
    })
    window.electron.ipcRenderer.sendMessage('create-album', [index]);
  }

  private isLastAlbumDisplayed(): boolean {
    // console.log("isLastAlbumDisplayed", this.state.albumsList.length, this.state.albumNo, this.state.albumsList.length - 1 <= this.state.albumNo)
    return this.state.albumsList.length - 1 <= this.state.albumNo
  }

  private isFirstAlbumDisplayed(): boolean {
    // console.log("isFirstAlbumDisplayed", this.state.albumNo, this.state.albumNo <= 0)
    return this.state.albumNo <= 0 
  }
  
  render() {
    if (!this.state.pagesLoaded) {return <div className='loader'/>}
    else
      return (
        <>
          <SettingsButtonComponent />
          albumNo: {this.state.albumNo}
          <div className="album-content">
            <TitleEditor albumId={this.state.album.id} />
            <ImageViewer
              albumId={this.state.album.id}
              onNextAlbumClick={this.onNextAlbumClick}
              onPrevAlbumClick={this.onPrevAlbumClick}
              shouldDisableNextButton={this.isLastAlbumDisplayed}
              shouldDisablePrevButton={this.isFirstAlbumDisplayed}
            />
            <DescriptionEditor albumId={this.state.album.id} />
          </div>
        </>
      );
    }
}
function uuidv4(): any {
  throw new Error('Function not implemented.');
}

