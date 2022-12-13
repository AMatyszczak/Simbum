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

  componentDidUpdate() {
    window.electron.ipcRenderer.sendMessage('image-description-text-changed', [
      this.state.pageId,
      this.state.name,
      this.state.text,
    ]);
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
            onChange={(v) => this.setState({ text: v })}
            modules={this.modules}
            className="album-image-description-content"
          />
        </div>
      </div>
    );
  }
}

export default DescriptionEditor;
