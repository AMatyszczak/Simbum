import '../App.css';
import 'react-quill/dist/quill.snow.css';
import DescriptionEditor from '../album_components/DescriptionEditor';
import TitleEditor from '../album_components/TitleEditor';
import ImageViewer from '../album_components/ImageViewer';
import SettingsButtonComponent from '../settings/SettingsButtonComponent';
import button_right from '../../../assets/buttons/button_right.png';
import button_right_plus from '../../../assets/buttons/button_right_plus.png';
import button_left from '../../../assets/buttons/button_left.png';
import button_left_plus from '../../../assets/buttons/button_left_plus.png';
import placeholder from '../../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';
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

  pagesList: {id: string, filename: string, path: string}[];
  imageHash: number;
  currentImagePath: string;
  nextImagePath: string;
  savedThumbnails: {path: string, filename: string, id: string}[];
  showedThumbnails: {path: string, filename: string, id: string}[];
  draggedElement: {path: string, filename: string, id: string};
  isDragging: boolean;
  indexOfDraggedElement: number
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
      
      pagesList: [],
      imageHash: Date.now(),
      currentImagePath: '',
      nextImagePath: '',
      savedThumbnails: [],
      showedThumbnails: [],
      draggedElement: {path: '', filename: '', id: ''},
      isDragging: false,
      indexOfDraggedElement: -1
    };

    this.onNextAlbumClick = this.onNextAlbumClick.bind(this);
    this.onPrevAlbumClick = this.onPrevAlbumClick.bind(this);
    this.isLastAlbumDisplayed = this.isLastAlbumDisplayed.bind(this);
    this.isFirstAlbumDisplayed = this.isFirstAlbumDisplayed.bind(this);
    this.deleteCurrentPage = this.deleteCurrentPage.bind(this);
  }

  componentDidMount() {
    this.loadAlbums();
    // this.loadAlbumByIndex(0);
    this.loadAlbumImages(true)
  }

  loadAlbums() {
    console.log("loadAlbums")
    window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
      console.log('get-album-map', arg)
      this.setState({albumsList: arg});
      console.log("before loadAlbum", this.state.albumsList)
      this.loadAlbumById(arg[0].id, 0)
    })
    window.electron.ipcRenderer.sendMessage('get-album-map', []);
  }

  loadAlbumById(id: number, pageNo: number) {
    console.log("loadAlbumById", id, this.state.albumsList)
    window.electron.ipcRenderer.once('get-album', (arg: any) => {
      console.log('get-album', arg) 
      
      this.setState({album: arg, pagesLoaded: true, pageNo: pageNo, albumNo: pageNo});
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
    console.log("onNextAlbumClick: ", this.state.albumNo, "<-")
    if (this.isLastAlbumDisplayed()) {
      this.createNewAlbum(this.state.albumNo + 1);
    } else {
      this.moveToAlbum(this.state.albumNo + 1);
    }
  }

  onPrevAlbumClick() {
    console.log("onPrevAlbumClick", this.state.albumNo)
    if (this.isFirstAlbumDisplayed()) {
      this.createNewAlbum(this.state.albumNo);
    } else {
      this.moveToAlbum(this.state.albumNo - 1);
    }
  }

  moveToAlbum(albumNo: number) {
    this.loadAlbumByIndex(albumNo)
    this.loadAlbumImages(true)
  }

  createNewAlbum(index: number) {
    console.log("createNewAlbum", index, this.state.albumNo)
    window.electron.ipcRenderer.once('get-album-map', (arg: any) => {
      console.log("createNewAlbum get-album-map:", arg)
      this.setState({albumsList: arg});
      console.log("createNewAlbum in once", index, arg)
      this.loadAlbumById(arg[index].id, index)
      this.loadAlbumImages(true)
    })
    window.electron.ipcRenderer.sendMessage('create-album', [index]);
  }

  private isLastAlbumDisplayed(): boolean {
    return this.state.albumsList.length - 1 <= this.state.albumNo
  }

  private isFirstAlbumDisplayed(): boolean {
    return this.state.albumNo <= 0 
  }

  private deleteCurrentPage(): any {
    
    if(this.state.album.imagesIds.length > 1) {
      window.electron.ipcRenderer.sendMessage('page-image-deleted', [this.state.pageNo]);
      
    
    }

  }
  
  handleDropOnMainImage = (e: any) => {
    e.preventDefault()
    
    this.setState({isDragging: false})
    
    const file = e.dataTransfer.files.item(0);

    if (file.type.includes('image/')) {
      this.setState({ currentImagePath: `file://${file.path}` });

      if(this.state.pageId != null) {
        window.electron.ipcRenderer.sendMessage('page-image-changed', [
          this.state.album.id,
          this.state.pageId,
          file.path,
        ]);
      }
      
      this.loadAlbumImages(false);
    }
    e.stopPropagation()
  }

  handleDropOnThumbnails = (e: any) => {
    e.preventDefault()
    if(e.target.className == "album-image-thumbnail-container" || e.target.className == "album-image-thumbnail-list") {
      this.setState({isDragging: false, showedThumbnails: [...this.state.savedThumbnails]})
    }

    this.setState({isDragging: false})
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
        console.log('get-album-images')
        this.loadAlbumImages(false);
      }); 
      
      window.electron.ipcRenderer.sendMessage('page-image-added', [
        this.state.album.id,
        this.state.indexOfDraggedElement,
        file.path
      ])

    } 
    e.stopPropagation();
  }; 

  handleDragOver = (e: any) => {
    e.preventDefault();

    if (this.state.isDragging) {
      let parentElement: any = e.target.className == 'album-image-thumbnail-list' ? e.target : e.target.parentElement

      const postionOfImageOnThumbnails = this.determinePositionOfImage(parentElement, e.clientX, false)

      if (this.state.indexOfDraggedElement !== postionOfImageOnThumbnails) {
        const thumbs = [...this.state.savedThumbnails]
        thumbs.splice(postionOfImageOnThumbnails, 0, this.state.draggedElement)
        this.setState({showedThumbnails: thumbs, indexOfDraggedElement: postionOfImageOnThumbnails})
      }
    }

    e.stopPropagation();
  };

  handleLeave = (e: any) => {
    e.preventDefault();

    if(this.state.isDragging && e.relatedTarget.className != "album-image-thumbnail-container" && e.relatedTarget.className != "album-image-thumbnail-list") {
      this.setState({isDragging: false})
      this.setState({isDragging: false, showedThumbnails: [...this.state.savedThumbnails], indexOfDraggedElement: -1})
    }

    e.stopPropagation();
  };

  handleDragEnter = (e: any) => {
    e.preventDefault();

    if (e.target.parentElement.className == "album-image-thumbnail-list" && !this.state.isDragging) {
      const postionOfImageOnThumbnails = this.determinePositionOfImage(e.target.parentElement, e.clientX, false)
      
      let thumbs: {path: string, filename: string, id: string}[] = [...this.state.savedThumbnails]
      let ele = {
        path: "file:///home/adrian/Desktop/SimBumStaff/img_placeholder.png",
        filename: "",
        id: "69",
      }
      thumbs.splice(postionOfImageOnThumbnails, 0, ele);

      this.setState({ showedThumbnails: thumbs, isDragging: true, indexOfDraggedElement: postionOfImageOnThumbnails, draggedElement: ele});
      e.stopPropagation();
    }
  }

  private determinePositionOfImage(parentElement: any, clientX: any, addImageWith: boolean) {
    let imageWidth = 120 + 8;
    let parentElementBoundRect = parentElement.getBoundingClientRect()

    const scrollLeft = parentElement.scrollLeft;
    let relativeX = clientX - parentElementBoundRect.left + scrollLeft;    
    if (addImageWith) {
      relativeX += imageWidth;
    }
    
    let postionOfImage = Math.floor(relativeX/imageWidth)
    if (postionOfImage < 0 ) {
      postionOfImage = 0
    }
    return postionOfImage
  }

  handleDragEnd = (e: any) => {
    e.preventDefault();
    this.setState({isDragging: false})
    e.stopPropagation();
  }

  private loadAlbumImages(showFirstPage: boolean) {
    window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
      const thumbnails: {path: string, filename: string, id: string}[] = arg ? arg : []
      console.log("loadAlbumImages:", thumbnails)
      if(thumbnails.length >0) {
        if(showFirstPage === true) {
          this.setState({imageHash: Date.now(), pageId: thumbnails[0].id, currentImagePath: thumbnails[0].path, pagesList: thumbnails, savedThumbnails: thumbnails, showedThumbnails: thumbnails });
        } else {
          this.setState({imageHash: Date.now(), pagesList: thumbnails, savedThumbnails: thumbnails, showedThumbnails: thumbnails });
        }
      } else {
          this.setState({currentImagePath: "", pagesList: [], savedThumbnails: [], showedThumbnails: [] });
      }
    });
    window.electron.ipcRenderer.sendMessage('get-album-images', [
      this.state.album.id,
    ]);
  }

  moveToPage(pageId: string) {
    const pageNo: any = this.state.pagesList.findIndex((e: any) => e.id == pageId.toString())

    if(pageNo != -1) {
      this.setState({
        pageId: this.state.pagesList[pageNo].id,
        currentImagePath: this.state.pagesList[pageNo].path
      });
    }
  }

  private determineNextButtonImg() {
    return this.isLastAlbumDisplayed() ? button_left_plus : button_left
  }

  render() {
    if (!this.state.pagesLoaded) {return <div className='loader'/>}
    else
      return (
        <>
          <SettingsButtonComponent onTrashClick={this.deleteCurrentPage} />
          <div className="album-content">
            <TitleEditor albumId={this.state.album.id} />
            <div className='image-viewer-view'>        
              <div className="album-images-controller">
                <button
                  className="next-album-image-button"
                  type="button"
                >
                  <img
                    src={this.determineNextButtonImg()}
                    className="button-image"
                    alt=""
                    onClick={this.onNextAlbumClick}
                    draggable="false"
                  />
                </button>
                <div
                  className="album-image-container"
                  onDrop={(e) => this.handleDropOnMainImage(e)}
                  onDragOver={(e) => this.handleDragOver(e)}
                >
                  <img
                    draggable="false"
                    className="album-image"
                    src={`${(this.state.currentImagePath || placeholder)}?${this.state.imageHash})`}
                    alt=""
                  />
                </div>
                <button
                  className="prev-album-image-button"
                  type="button"
                >
                  <img
                    src={
                      this.isLastAlbumDisplayed()
                        ? button_right_plus
                        : button_right
                    }
                    className="button-image"
                    alt=""
                    onClick={this.onPrevAlbumClick}
                    draggable="false"
                  />

                </button>
              </div>
              <div className='album-image-thumbnail-list' 
                onDragEnter={(e) => this.handleDragEnter(e)} 
                onDragLeave={(e) => this.handleLeave(e)} 
                onDragOver={(e) => this.handleDragOver(e)}
                onDrop={(e) => this.handleDropOnThumbnails(e)} 
                >
                  {
                    this.state.showedThumbnails.map((thumbnail) => (
                      <div className='album-image-thumbnail-container'>
                        <img 
                          draggable="false"
                          src={`${thumbnail.path}?${this.state.imageHash}`}
                          key={thumbnail.id} 
                          className={this.state.isDragging ? "album-image-thumbnail thumbnail-drag-overlay" : "album-image-thumbnail"} 
                          onClick={(e) => this.moveToPage(thumbnail.id)}
                        />
                      </div>
                    ))
                  }
                </div>
            </div>
            <DescriptionEditor albumId={this.state.album.id} />
          </div>
        </>
      );
    }
}

