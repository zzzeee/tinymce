import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { CustomBlockData } from './Types';

const applyStyles = (editor: Editor, styles: any): void => {
  editor.formatter.apply('customblock', { styles });
};

export const register = (editor: Editor): {
  getCustomBlock: () => void;
  applyStyles: (styles: CustomBlockData) => void;
} => {
  return {
    getCustomBlock: Fun.noop, // Fun.noop 是一个空函数，用于占位
    applyStyles: (styles: CustomBlockData) => applyStyles(editor, styles)
  };
};