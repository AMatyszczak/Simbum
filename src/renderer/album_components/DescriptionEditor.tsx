import React from 'react';
import ReactQuill from 'react-quill';
import { PageIdProps } from './PageIdProps';

interface DescriptionState {
  albumId: string;
  name: string;
  text: string;
}

class DescriptionEditor extends React.Component<PageIdProps, DescriptionState> {
  constructor(props: PageIdProps) {
    super(props);

    this.state = {
      albumId: props.albumId,
      name: props.albumId,
      text: '',
    };
  }

  onTextChanged(text: any) {
    this.setState({ text: text });
    window.electron.ipcRenderer.sendMessage('page-description-changed', [
      this.props.albumId,
      this.props.albumId,
      text,
    ]);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps: PageIdProps) {
    if (prevProps.albumId != this.props.albumId) {
      this.loadData();
    }
  }

  modules = {
    toolbar: false,
    clipboard: {
      matchVisual: false,
    },
  };

  render() {
    return (
      <div className="album-image-description-container">
        <div className="album-image-description-scrollbar">
          <ReactQuill
            theme="snow"
            value={this.state.text}
            onChange={(v) => this.onTextChanged(v)}
            modules={this.modules}
            className="album-image-description-content"
          />
        </div>
      </div>
    );
  }

  private loadData() {
    window.electron.ipcRenderer.once('get-page-description', (arg: any) => {
      this.setState({ text: arg });
    });
    window.electron.ipcRenderer.sendMessage('get-page-description', [
      this.props.albumId,
    ]);
  }
}

export default DescriptionEditor;
