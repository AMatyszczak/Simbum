import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import button_left_disabled from '../../assets/buttons/button_left_disabled.png'
// import button_right_disabled from '../../assets/buttons/button_right_disabled.png'
import './App.css';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoScrollPlugin } from '@lexical/react/LexicalAutoScrollPlugin';
import { AutoLinkNode } from '@lexical/link';
import TabulateOnTabPressPlugin from 'plugins/TabulateOnTabPressPlugin';
import button_right from '../../assets/buttons/button_right.png';
import button_left from '../../assets/buttons/button_left.png';
import placeholder from '../../assets/img_placeholder.png';

function Placeholder() {
  return <div className="album-image-description-content" />;
}
const Simbum = () => {
  const editorConfig = {
    // The editor theme
    namespace: 'Simbumer',
    onError(error: any) {
      throw error;
    },
    nodes: [AutoLinkNode],
  };

  return (
    <div className="album-content">
      <input className="album-title" type="text" value="Przyjaciele" />
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

      <div className="album-image-description-container">
        <div className="album-image-description-scrollbar">
          <LexicalComposer initialConfig={editorConfig}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="album-image-description-content" />
              }
              placeholder={<Placeholder />}
            />
            <HistoryPlugin />
            <TabulateOnTabPressPlugin />
            {/* <AutoScrollPlugin scrollRef={containerWithScrollRef} /> */}
          </LexicalComposer>
        </div>
      </div>
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
