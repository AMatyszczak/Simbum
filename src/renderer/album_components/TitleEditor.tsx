import { useEffect, useState } from 'react';

function TitleEditor() {
  const [value, setValue] = useState('Przyjaciele');

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('image-title-text-added', [value]);
  }, [value]);
  return (
    <input
      className="album-title-content"
      type="text"
      spellCheck="false"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export default TitleEditor;
