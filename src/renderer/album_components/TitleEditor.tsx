import React, { useEffect, useState } from 'react';
import { PageIdProps } from './PageIdProps';

interface TitleState {
  name: string;
  text: string;
}

class TitleEditor extends React.Component<PageIdProps, TitleState> {
  constructor(props: PageIdProps) {
    super(props);
    console.log('TitleEditor const');
    this.state = {
      name: props.pageId,
      text: 'Przyjaciele',
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

  onTextChanged(event: any) {
    const eventText = event.target.value;
    this.setState({ text: eventText });
    window.electron.ipcRenderer.sendMessage('page-title-changed', [
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

  private loadData() {
    window.electron.ipcRenderer.once('get-page-title', (arg: any) => {
      this.setState({ text: arg });
    });
    window.electron.ipcRenderer.sendMessage('get-page-title', [
      this.props.pageId,
    ]);
  }
}

export default TitleEditor;
