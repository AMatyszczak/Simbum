import { useEffect, useState } from 'react';

function TitleEditor() {
  const [id, setId] = useState('123');
  const [name, setName] = useState('0');
  const [text, setText] = useState('Przyjaciele');

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('image-title-text-added', [
      id,
      name,
      text,
    ]);
  }, [id, name, text]);
  return (
    <input
      className="album-title-content"
      type="text"
      spellCheck="false"
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  );
}

export default TitleEditor;
