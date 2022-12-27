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
      name: props.pageId,
      text: 'Przyjaciele',
    };
  }

  componentDidUpdate(prevProps: PageIdProps) {
    if (prevProps.pageId != this.props.pageId) {
      window.electron.ipcRenderer.once('get-page-title', (arg: any) => {
        this.setState({ text: arg });
      });
      window.electron.ipcRenderer.sendMessage('get-page-title', [
        this.props.pageId,
      ]);
    }
  }

  onTextChanged(event: any) {
    const eventText = event.target.value;
    this.setState({ text: eventText });
    window.electron.ipcRenderer.sendMessage('image-title-text-changed', [
      this.props.pageId,
      this.props.pageId,
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
}

export default TitleEditor;
