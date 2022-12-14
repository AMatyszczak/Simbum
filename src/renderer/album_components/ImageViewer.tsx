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
  pagesList: string[];
  pageId: string;
  onNextPageClick: any;
  onPrevPageClick: any;
}

interface ImageViewerState {
  imagePath: string;
}

class ImageViewer extends React.Component<ImageViewerProps, ImageViewerState> {
  constructor(props: ImageViewerProps) {
    super(props);

    this.state = {
      imagePath: '',
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps: PageIdProps) {
    if (prevProps.pageId != this.props.pageId) {
      this.loadData();
    }
  }

  handleDrop = (e: any) => {
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      this.setState({ imagePath: `file://${file.path}` });
      window.electron.ipcRenderer.sendMessage('page-image-changed', [
        this.props.pageId,
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

  shouldDisablePrevButton(pageId: string) {
    return this.checkIfFirstPage(pageId, this.props.pagesList);
  }

  shouldDisableNextButton(pageId: string) {
    return pageId == null || !this.checkIfImageSet(this.state.imagePath);
  }

  private checkIfLastPage(pageId: string, pagesList: string[]) {
    return pageId === pagesList[pagesList.length - 1];
  }

  private checkIfFirstPage(pageId: string, pagesList: string[]) {
    return pageId === pagesList[0];
  }

  private loadData() {
    window.electron.ipcRenderer.once('get-page-image', (arg: any) => {
      this.setState({ imagePath: arg ? arg : '' });
    });
    window.electron.ipcRenderer.sendMessage('get-page-image', [
      this.props.pageId,
    ]);
  }

  private checkIfImageSet(imagePath: string) {
    return imagePath != null && imagePath != '';
  }

  private determineButtonImg() {
    if (this.checkIfLastPage(this.props.pageId, this.props.pagesList)) {
      return button_left_create_page;
    }
    if (this.shouldDisableNextButton(this.props.pageId)) {
      return button_left_disabled;
    }

    return button_left;
  }

  render() {
    return (
      <div className="album-images-controller">
        <button
          className="next-album-image-button"
          type="button"
          disabled={this.shouldDisableNextButton(this.props.pageId)}
        >
          <img
            src={this.determineButtonImg()}
            className="button-image"
            alt=""
            onClick={this.props.onNextPageClick}
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
        <button
          className="prev-album-image-button"
          type="button"
          disabled={this.shouldDisablePrevButton(this.props.pageId)}
        >
          <img
            src={
              this.shouldDisablePrevButton(this.props.pageId)
                ? button_right_disabled
                : button_right
            }
            className="button-image"
            alt=""
            onClick={this.props.onPrevPageClick}
          />
        </button>
      </div>
    );
  }
}

export default ImageViewer;
