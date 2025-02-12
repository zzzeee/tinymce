import Editor from 'tinymce/core/api/Editor';

import { openDialog } from './Dialog';

const registerButtons = (editor: Editor): void => {
  // 添加到 Insert 菜单
  editor.ui.registry.addMenuItem('customblock', {
    text: 'Custom Block',
    icon: 'transform-image',
    onAction: () => {
      openDialog(editor);
    }
  });

  // 注册按钮（如果还需要工具栏按钮的话）
  editor.ui.registry.addButton('customblock', {
    icon: 'transform-image',
    tooltip: 'Custom Block',
    onAction: () => {
      openDialog(editor);
    }
  });
};

export {
  registerButtons
};