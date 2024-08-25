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
      albumId: props.turnId,
      name: props.turnId,
      text: '',
    };
  }

  onTextChanged(text: any) {
    this.setState({ text: text });
    window.electron.ipcRenderer.sendMessage('album-description-changed', [
      this.props.turnId,
      this.props.turnId,
      text,
    ]);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps: PageIdProps) {
    if (prevProps.turnId != this.props.turnId) {
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
    window.electron.ipcRenderer.once('get-album-description', (arg: any) => {
      this.setState({ text: arg });
    });
    window.electron.ipcRenderer.sendMessage('get-album-description', [
      this.props.turnId,
    ]);
  }
}

export default DescriptionEditor;
