import button_right from '../../../assets/buttons/button_right.png';
import button_right_plus from '../../../assets/buttons/button_right_plus.png';
import button_left from '../../../assets/buttons/button_left.png';
import button_left_plus from '../../../assets/buttons/button_left_plus.png';
import placeholder from '../../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';
import React from 'react';

interface ImageViewerProps {
  albumId: string;
  onNextAlbumClick: any;
  onPrevAlbumClick: any;
  shouldDisableNextButton: any;
  shouldDisablePrevButton: any;
}

interface ImageViewerState {
  imageHash: number;
  pageId: string;
  pagesList: {id: string, filename: string, path: string}[];
  currentImagePath: string;
  nextImagePath: string;
  savedThumbnails: {path: string, filename: string, id: string}[];
  showedThumbnails: {path: string, filename: string, id: string}[];
  draggedElement: {path: string, filename: string, id: string};
  isDragging: boolean;
  indexOfDraggedElement: number
}

class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
  constructor(props: ImageViewerProps) {
    super(props);

    this.state = {
      imageHash: Date.now(),
      pageId: '0',
      pagesList: [],
      currentImagePath: '',
      nextImagePath: '',
      savedThumbnails: [],
      showedThumbnails: [],
      draggedElement: {path: '', filename: '', id: ''},
      isDragging: false,
      indexOfDraggedElement: -1
    };
    this.loadAlbumImages(true);
  }

  componentDidUpdate(prevProps: ImageViewerProps) {
    if (prevProps.albumId != this.props.albumId) {
      this.loadAlbumImages(true);
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
          this.props.albumId,
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
      console.log("albumId", this.props)
      window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
        console.log('get-album-images')
        this.loadAlbumImages(false);
      }); 
      
      window.electron.ipcRenderer.sendMessage('page-image-added', [
        this.props.albumId,
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
      this.props.albumId,
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
    return this.props.shouldDisableNextButton() ? button_left_plus : button_left
  }

  render() {
    return (
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
              onClick={this.props.onNextAlbumClick}
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
                this.props.shouldDisablePrevButton(this.state.pageId)
                  ? button_right_plus
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
    );
  }  
}

export default ImageViewer;
