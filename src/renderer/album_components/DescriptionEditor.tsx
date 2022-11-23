import { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';

function DescriptionEditor() {
  const [value, setValue] = useState('');

  useEffect(() => {
    window.electron.ipcRenderer.sendMessage('image-description-text-added', [
      value,
    ]);
  }, [value]);

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
          value={value}
          onChange={setValue}
          modules={modules}
          className="album-image-description-content"
        />
      </div>
    </div>
  );
}

export default DescriptionEditor;
