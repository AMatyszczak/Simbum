import { useState } from 'react';
import button_right from '../../../assets/buttons/button_right.png';
import button_left from '../../../assets/buttons/button_left.png';
import placeholder from '../../../assets/img_placeholder.png';
import 'react-quill/dist/quill.snow.css';

function ImageViewer() {
  const [id, setId] = useState('123');
  const [name, setName] = useState('0');
  const [imagePath, setImagePath] = useState('');

  const handleDrop = (e: any) => {
    const file = e.dataTransfer.files.item(0);
    if (file.type.includes('image/')) {
      setImagePath(`file://${file.path}`);
      window.electron.ipcRenderer.sendMessage('image-added', [
        id,
        name,
        file.path,
      ]);
    }
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragOver = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragEnter = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDropLeave = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="album-images-controller">
      <button className="previous-album-image-button" type="button">
        <img src={button_left} className="button-image" alt="" />
      </button>
      <div className="album-image-container" onDrop={(e) => handleDrop(e)}>
        <img
          draggable="false"
          className="album-image"
          src={imagePath || placeholder}
          alt=""
          onDrop={(e) => handleDrop(e)}
          onDragOver={(e) => handleDragOver(e)}
          onDragEnter={(e) => handleDragEnter(e)}
          onDragLeave={(e) => handleDropLeave(e)}
        />
      </div>
      <button className="next-album-image-button" type="button">
        <img src={button_right} className="button-image" alt="" />
      </button>
    </div>
  );
}

export default ImageViewer;
