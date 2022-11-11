import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import './App.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoLinkNode } from '@lexical/link';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import button_right from '../../assets/buttons/button_right.png';
import button_left from '../../assets/buttons/button_left.png';
import placeholder from '../../assets/img_placeholder.png';

function populateDescriptionEditor() {
  const root = $getRoot();

  const paragraphNode = $createParagraphNode();
  const textNode = $createTextNode('Hello world');
  paragraphNode.append(textNode);
  root.append(paragraphNode);
}

function DescriptionEditor() {
  const initialConfig = {
    // The editor theme
    namespace: 'Simbumer',
    onError(error: any) {
      throw error;
    },
    nodes: [AutoLinkNode],
    editorState: populateDescriptionEditor,
  };

  return (
    <div className="album-image-description-container">
      <div className="album-image-description-scrollbar">
        <LexicalComposer initialConfig={initialConfig}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                id="Simbumer"
                className="album-image-description-content"
              />
            }
            placeholder={<div />}
          />
          <HistoryPlugin />
        </LexicalComposer>
      </div>
    </div>
  );
}

const Simbum = () => {
  return (
    <div className="album-content">
      <input
        className="album-title-content"
        type="text"
        defaultValue="Przyjaciele"
        spellCheck="false"
      />
      <div className="album-images-controller">
        <button className="previous-album-image-button" type="button">
          <img src={button_left} className="button-image" alt="" />
        </button>
        <img
          id="dropped_image"
          draggable="false"
          className="album-image"
          src={placeholder}
          alt=""
        />
        <button className="next-album-image-button" type="button">
          <img src={button_right} className="button-image" alt="" />
        </button>
      </div>

      <DescriptionEditor />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Simbum />} />
      </Routes>
    </Router>
  );
}
