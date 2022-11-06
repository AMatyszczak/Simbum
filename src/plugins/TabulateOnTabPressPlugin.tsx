import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  KEY_TAB_COMMAND,
  COMMAND_PRIORITY_HIGH,
  CONTROLLED_TEXT_INSERTION_COMMAND,
} from 'lexical';
import { useEffect } from 'react';

export default function TabulateOnTabPressPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }
        event.preventDefault();
        return editor.dispatchCommand(CONTROLLED_TEXT_INSERTION_COMMAND, '\t');
      },
      COMMAND_PRIORITY_HIGH
    );
  }, [editor]);

  return null;
}
