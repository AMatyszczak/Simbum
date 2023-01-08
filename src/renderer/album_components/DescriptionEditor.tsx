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
      text: '',
    };
  }

  onTextChanged(text: any) {
    this.setState({ text: text });
    window.electron.ipcRenderer.sendMessage('page-description-changed', [
      this.props.pageId,
      this.props.pageId,
      text,
    ]);
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps: PageIdProps) {
    if (prevProps.pageId != this.props.pageId) {
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
      this.props.pageId,
    ]);
  }
}

export default DescriptionEditor;
