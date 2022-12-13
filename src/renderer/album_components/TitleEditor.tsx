import React, { useEffect, useState } from 'react';
import { PageIdProps } from './PageIdProps';

interface TitleState {
  pageId: string;
  name: string;
  text: string;
}

class TitleEditor extends React.Component<PageIdProps, TitleState> {
  constructor(props: PageIdProps) {
    super(props);

    this.state = {
      pageId: props.pageId,
      name: props.pageId,
      text: 'Przyjaciele',
    };
  }

  componentDidMount() {
    console.log('mount');
  }

  componentDidUpdate() {
    window.electron.ipcRenderer.sendMessage('image-title-text-changed', [
      this.state.pageId,
      this.state.name,
      this.state.text,
    ]);
  }

  render() {
    return (
      <input
        className="album-title-content"
        type="text"
        spellCheck="false"
        value={this.state.text}
        onChange={(e) => this.setState({ text: e.target.value })}
      />
    );
  }
}

export default TitleEditor;
