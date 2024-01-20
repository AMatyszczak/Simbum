import React, { useEffect, useState } from 'react';
import { PageIdProps } from './PageIdProps';

interface TitleState {
  name: string;
  text: string;
}

class TitleEditor extends React.Component<PageIdProps, TitleState> {
  constructor(props: PageIdProps) {
    super(props);
    this.state = {
      name: props.albumId,
      text: '',
    };
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps: PageIdProps) {
    if (prevProps.albumId != this.props.albumId) {
      this.loadData();
    }
  }

  onTextChanged(event: any) {
    const eventText = event.target.value;
    this.setState({ text: eventText });
    window.electron.ipcRenderer.sendMessage('page-title-changed', [
      this.props.albumId,
      this.props.albumId,
      eventText,
    ]);
  }

  render() {
    return (
      <input
        className="album-title-content"
        type="text"
        spellCheck="false"
        value={this.state.text}
        onChange={(e) => this.onTextChanged(e)}
      />
    );
  }

  private loadData() {
    window.electron.ipcRenderer.once('get-album-title', (arg: any) => {
      this.setState({ text: arg });
    });
    window.electron.ipcRenderer.sendMessage('get-album-title', [
      this.props.albumId,
    ]);
  }
}

export default TitleEditor;
