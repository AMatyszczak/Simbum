import button_right from '../../../assets/buttons/button_right.png';
import button_left from '../../../assets/buttons/button_left.png';
import button_right_disabled from '../../../assets/buttons/button_right_disabled.png';
import button_left_disabled from '../../../assets/buttons/button_left_disabled.png';
import button_left_create_page from '../../../assets/buttons/button_left_disabled.png';
import placeholder from '../../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';
import { PageIdProps } from './PageIdProps';
import React from 'react';

interface ImageViewerProps {
  albumId: string;
  pagesList: string[];
  pageId: string;
  onNextAlbumClick: any;
  onPrevAlbumClick: any;
  moveToPage: any;
  shouldDisableNextButton: any;
  shouldDisablePrevButton: any;
}

interface ImageViewerState {
  currentImagePath: string;
  nextImagePath: string;
  savedThumbnails: {path: string, id: number}[];
  showedThumbnails: {path: string, id: number}[];
  draggedElement: {path: string, id: number};
  isDragging: boolean;
  indexOfDraggedElement: number
}

class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
  constructor(props: ImageViewerProps) {
    super(props);

    this.state = {
      currentImagePath: '',
      nextImagePath: '',
      savedThumbnails: [],
      showedThumbnails: [],
      draggedElement: {path: '', id: -1},
      isDragging: false,
      indexOfDraggedElement: -1
    };
    this.loadAlbumThumbnails();
  }

  componentDidMount() {
    this.loadCurrentImagePath();
    this.loadAlbumThumbnails();
  }

  componentDidUpdate(prevProps: ImageViewerProps) {
    if (prevProps.pageId != this.props.pageId || prevProps.albumId != this.props.albumId) {
      this.loadCurrentImagePath();
      this.loadAlbumThumbnails();
    }
  }

  handleDrop = (e: any) => {
    if(e.target.className == "album-image-thumbnail-container" || e.target.className == "album-image-thumbnail-list") {
      this.setState({isDragging: false, showedThumbnails: [...this.state.savedThumbnails]})
    }

    this.setState({isDragging: false})
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      // this.setState({ currentImagePath: `file://${file.path}` });


      window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
        const thumbnails = arg ? arg : []
        this.setState({ savedThumbnails: thumbnails, showedThumbnails: thumbnails });
      }); 
      
      window.electron.ipcRenderer.sendMessage('page-image-added', [
        this.props.albumId,
        this.state.indexOfDraggedElement,
        file.path
      ])

      // window.electron.ipcRenderer.sendMessage('page-image-changed', [
      //   this.props.albumId,
      //   this.props.pageId,
      //   file.path,
      // ]);
    }
    e.preventDefault();
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

  handleDropLeave = (e: any) => {
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
      
      let thumbs: {path: string, id: number}[] = [...this.state.savedThumbnails]
      let ele = {
        path: "file:///home/adrian/Desktop/SimBumStaff/img_placeholder.png",
        id: 69,
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
    this.setState({isDragging: false})
    e.preventDefault();
    e.stopPropagation();
  }

  private loadAlbumThumbnails() {
    window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
      const thumbnails = arg ? arg : []
      this.setState({ savedThumbnails: thumbnails, showedThumbnails: thumbnails });
    });
    window.electron.ipcRenderer.sendMessage('get-album-images', [
      this.props.albumId,
    ]);
  }

  private loadCurrentImagePath() {
    window.electron.ipcRenderer.once('get-album-page-image', (arg: any) => {
      this.setState({ currentImagePath: arg ? arg : '' });
      this.loadNextImagePath()
    });
    window.electron.ipcRenderer.sendMessage('get-album-page-image', [
      this.props.albumId, this.props.pageId,
    ]);
  }

  private loadNextImagePath() {
    window.electron.ipcRenderer.once('get-album-page-image', (arg: any) => {
      this.setState({ nextImagePath: arg ? arg : '' });
    });

    const index = this.props.pagesList.findIndex(page => page == this.props.pageId)
    window.electron.ipcRenderer.sendMessage('get-album-page-image', [
      this.props.pagesList[index + 1],
    ]);
  }

  private determineButtonImg() {
    // if (this.checkIfLastPage(this.props.pageId, this.props.pagesList) || !this.checkIfImageSet(this.state.nextImagePath)) {
    //   return button_left_create_page;
    // }
    // if (this.shouldDisableNextButton(this.props.pageId)) {
    //   return button_left_disabled;
    // }

    return button_left;
  }

  render() {
    return (
      <div className='image-viewer-view'>        
        <div className="album-images-controller" >
          <button
            className="next-album-image-button"
            type="button"
            disabled={this.props.shouldDisableNextButton()}
          >
            <img
              src={this.determineButtonImg()}
              className="button-image"
              alt=""
              onClick={this.props.onNextAlbumClick}
              draggable="false"
            />
          </button>
          <div
            className="album-image-container"
            onDrop={(e) => this.handleDrop(e)}
          >
            <img
              draggable="false"
              className="album-image"
              src={this.state.currentImagePath || placeholder}
              alt=""
            />
          </div>
          <button
            className="prev-album-image-button"
            type="button"
            disabled={this.props.shouldDisablePrevButton()}
          >
            <img
              src={
                this.props.shouldDisablePrevButton(this.props.pageId)
                  ? button_right_disabled
                  : button_right
              }
              className="button-image"
              alt=""
              onClick={this.props.onPrevAlbumClick}
              draggable="false"
            />

          </button>
        </div>
        <div className='album-image-thumbnail-list' 
          onDragEnter={(e) => this.handleDragEnter(e)} 
          onDragLeave={(e) => this.handleDropLeave(e)} 
          onDragOver={(e) => this.handleDragOver(e)}
          onDrop={(e) => this.handleDrop(e)}>
            {
              this.state.showedThumbnails.map((thumbnail) => (
                <div className='album-image-thumbnail-container'>
                  <img 
                    draggable="false"
                    src={thumbnail.path} 
                    key={thumbnail.id} 
                    className={this.state.isDragging ? "album-image-thumbnail thumbnail-drag-overlay" : "album-image-thumbnail"} 
                    onClick={(e) => this.props.moveToPage(thumbnail.id)}
                  />
                </div>
              ))
              
            }
            
          </div>
      </div>
    );
  }
}

export default ImageViewer;
