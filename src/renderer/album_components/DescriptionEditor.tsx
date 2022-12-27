import React from 'react';
import ReactQuill from 'react-quill';
import { PageIdProps } from './PageIdProps';

interface DescriptionState {
  pageId: string;
  name: string;
  text: string;
}

class DescriptionEditor extends React.Component<PageIdProps, DescriptionState> {
  constructor(props: PageIdProps) {
    super(props);

    this.state = {
      pageId: props.pageId,
      name: props.pageId,
      text: 'opis',
    };
  }

  onTextChanged(text: any) {
    this.setState({ text: text });
    window.electron.ipcRenderer.sendMessage('image-description-text-changed', [
      this.props.pageId,
      this.props.pageId,
      text,
    ]);
  }

  componentDidUpdate(prevProps: PageIdProps) {
    if (prevProps.pageId != this.props.pageId) {
      window.electron.ipcRenderer.once('get-page-description', (arg: any) => {
        this.setState({ text: arg });
      });
      window.electron.ipcRenderer.sendMessage('get-page-description', [
        this.props.pageId,
      ]);
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
}

export default DescriptionEditor;
