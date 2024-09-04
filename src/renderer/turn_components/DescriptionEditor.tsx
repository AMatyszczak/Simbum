import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';


export default function DescriptionEditor(props: any) {
  
  const familyId = props.familyId
  const [turnId, setTurnId] = useState<string>(props.turnId)
  const [text, setText] = useState<string>("")

  useEffect(() => {
    console.log("DescriptionEditor", props )
    setTurnId(props.turnId)
    loadData()
  }, [props])


  function onTextChanged(text: any) {
    setText(text)
    // console.log("onTextChanged", familyId, turnId, text)
    window.electron.ipcRenderer.sendMessage('turn-description-changed', [
      familyId,
      turnId,
      text,
    ]);
  }

  const modules = {
    toolbar: false,
    clipboard: {
      matchVisual: false,
    },
  };

  function loadData() {
    window.electron.ipcRenderer.once('get-turn-description', (arg: any) => {
      setText(arg)
    });
    window.electron.ipcRenderer.sendMessage('get-turn-description', [
      familyId, turnId,
    ]);
  }

  
  return (
    <div className="turn-image-description-container">
      <div className="turn-image-description-scrollbar">
        <ReactQuill
          theme="snow"
          value={text}
          onChange={(v) => onTextChanged(v)}
          modules={modules}
          className="turn-image-description-content"
        />
      </div>
    </div>
  );
  
}
