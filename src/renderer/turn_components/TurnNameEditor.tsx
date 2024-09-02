import React, { useEffect, useState } from 'react';
import { PageIdProps } from './PageIdProps';

interface TitleState {
  name: string;
  text: string;
}

export default function TurnNameEditor(props: any) {
  
  const familyId = props.familyId;
  const turnId = props.turnId;
  const [text, setText] = useState("") 
  
  
  useEffect(() => {
    // if (prevProps.turnId != this.props.turnId) {
    //   loadData();
    // }
    loadData();
  }, [])

  function onTextChanged(event: any) {
    const eventText = event.target.value;
    // this.setState({ text: eventText });
    setText(eventText)
    window.electron.ipcRenderer.sendMessage('update-turn-name', [
      familyId,
      turnId,
      eventText,
    ]);
  }

  return (
    <input
      className="turn-title-content"
      type="text"
      spellCheck="false"
      value={text}
      onChange={(e) => onTextChanged(e)}
    />
  );
  

  function loadData() {
    window.electron.ipcRenderer.once('get-turn-name', (arg: any) => {
      console.log('get-turn-name:', arg)
      setText(arg)
    });
    window.electron.ipcRenderer.sendMessage('get-turn-name', [familyId, turnId]);
  }
}
