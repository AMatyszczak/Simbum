import { useEffect, useState } from 'react';
import path from 'path';
import fs from 'fs';

function TitleEditor() {
  const [value, setValue] = useState('Przyjaciele');

  useEffect(() => {
    console.log('11', value, '/home/adrian/Desktop/hop');
    // fs.writeFileSync('/home/adrian/Desktop/hop/hop.txt', '123');
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
