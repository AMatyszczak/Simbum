import button_right from '../../../assets/buttons/button_right.png';
import button_left from '../../../assets/buttons/button_left.png';
import placeholder from '../../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';
import { PageIdProps } from './PageIdProps';
import React from 'react';
import { ImageViewerProps } from './ImageViewerProps';

interface ImageViewerState {
  pageId: string;
  name: string;
  imagePath: string;
}

class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
  constructor(props: ImageViewerProps) {
    super(props);

    this.state = {
      pageId: props.pageId,
      name: props.pageId,
      imagePath: '',
    };
  }

  handleDrop = (e: any) => {
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      this.setState({ imagePath: `file://${file.path}` });
      window.electron.ipcRenderer.sendMessage('image-changed', [
        this.state.pageId,
        this.state.name,
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

  render() {
    return (
      <div className="album-images-controller">
        <button className="previous-album-image-button" type="button">
          <img
            src={button_left}
            className="button-image"
            alt=""
            onClick={this.props.onPrevPageClick}
          />
        </button>
        <div
          className="album-image-container"
          onDrop={(e) => this.handleDrop(e)}
        >
          <img
            draggable="false"
            className="album-image"
            src={this.state.imagePath || placeholder}
            alt=""
            onDrop={(e) => this.handleDrop(e)}
            onDragOver={(e) => this.handleDragOver(e)}
            onDragEnter={(e) => this.handleDragEnter(e)}
            onDragLeave={(e) => this.handleDropLeave(e)}
          />
        </div>
        <button className="next-album-image-button" type="button">
          <img
            src={button_right}
            className="button-image"
            alt=""
            onClick={this.props.onNextPageClick}
          />
        </button>
      </div>
    );
  }
}

export default ImageViewer;
