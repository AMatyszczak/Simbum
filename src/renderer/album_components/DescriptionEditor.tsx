import { useState } from 'react';
import ReactQuill from 'react-quill';

function DescriptionEditor() {
  const [value, setValue] = useState('');

  const modules = {
    toolbar: false,
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'font',
    'size',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
  ];

  return (
    <div className="album-image-description-container">
      <div className="album-image-description-scrollbar">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={setValue}
          modules={modules}
          formats={formats}
          className="album-image-description-content"
        />
      </div>
    </div>
  );
}

export default DescriptionEditor;
