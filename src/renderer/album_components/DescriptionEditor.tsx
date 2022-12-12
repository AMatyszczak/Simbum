import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';

function DescriptionEditor() {
  const [id, setId] = useState('123');
  const [name, setName] = useState('0');
  const [text, setText] = useState('');

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('image-description-text-added', [
      id,
      name,
      text,
    ]);
  }, [id, name, text]);

  const modules = {
    toolbar: false,
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <div className="album-image-description-container">
      <div className="album-image-description-scrollbar">
        <ReactQuill
          theme="snow"
          value={text}
          onChange={setText}
          modules={modules}
          className="album-image-description-content"
        />
      </div>
    </div>
  );
}

export default DescriptionEditor;
