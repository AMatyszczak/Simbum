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
  shouldDisableNextButton: any
  shouldDisablePrevButton: any
}

interface ImageViewerState {
  currentImagePath: string;
  nextImagePath: string;
  thumbnails: {path: string, id: number}[];
}

class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
  constructor(props: ImageViewerProps) {
    super(props);

    this.state = {
      currentImagePath: '',
      nextImagePath: '',
      thumbnails: []
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
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      this.setState({ currentImagePath: `file://${file.path}` });
      window.electron.ipcRenderer.sendMessage('page-image-changed', [
        this.props.albumId,
        this.props.pageId,
        file.path,
      ]);
    }
    e.preventDefault();
    e.stopPropagation();
  };
  handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  handleDragEnter = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  handleDropLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  private loadAlbumThumbnails() {
    window.electron.ipcRenderer.once('get-album-images', (arg: any) => {
      this.setState({ thumbnails: arg ? arg.reverse() : [] });
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
        <div className="album-images-controller">
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
              onDrop={(e) => this.handleDrop(e)}
              onDragOver={(e) => this.handleDragOver(e)}
              onDragEnter={(e) => this.handleDragEnter(e)}
              onDragLeave={(e) => this.handleDropLeave(e)}
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
            />
          </button>
        </div>
        <div className='album-image-thumbnail-list'>
            {
              this.state.thumbnails.map((thumbnail) => (
                <img src={thumbnail.path} key={thumbnail.id} className="album-image-thumbnail" width="110px" onClick={(e) => this.props.moveToPage(thumbnail.id)}></img>
              ))
            }
          </div>
      </div>
    );
  }
}

export default ImageViewer;
