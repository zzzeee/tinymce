import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

import { register } from './api/Api';
import { registerCommands } from './core/Commands';
import { registerFormats } from './core/Formats';
import { registerButtons } from './ui/Buttons';

// 直接在插件代码中嵌入样式
const pluginStyles = `
.custom-block-wrapper {
  position: relative;
  margin: 1em 0;
  cursor: pointer;
}

.custom-block {
  overflow-y: auto;
  box-sizing: border-box;
  cursor: text;
  white-space: pre-wrap;
  word-wrap: break-word;
  border: 1px solid transparent;
}

/* 选中状态样式 */
.custom-block-wrapper.selected > .custom-block {
  border-color: #4099ff;
  box-shadow: 0 0 0 1px #4099ff;
}

/* 确保图标容器始终显示在最上层 */
.custom-block-icons {
  position: absolute;
  top: 4px;
  right: 4px;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 3px;
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  gap: 5px;
  padding: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 1000;
}

/* 显示工具栏的条件 */
.custom-block-wrapper:hover > .custom-block-icons,
.custom-block-wrapper.selected > .custom-block-icons {
  opacity: 1;
}

/* 确保只有当前层级的工具栏显示 */
.custom-block-wrapper:hover .custom-block-wrapper > .custom-block-icons {
  opacity: 0;
}

.custom-block-wrapper:hover .custom-block-wrapper:hover > .custom-block-icons {
  opacity: 1;
}

.custom-block br {
  display: block;
  content: '';
  margin: 5px 0;
}

.custom-block-icon {
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}

.custom-block-icon:hover {
  background: #f0f0f0;
}

.custom-block-icon svg {
  width: 16px;
  height: 16px;
  fill: #666;
}

.custom-block-icon:hover svg {
  fill: #333;
}
`;

const setup = (editor: Editor): Record<string, unknown> => {
  try {
    // 确保 editor.formatter 已经初始化
    editor.on('init', () => {
      registerFormats(editor);
      registerButtons(editor);

      // 创建 style 元素
      const styleElm = editor.dom.create('style', {
        type: 'text/css'
      }, pluginStyles);

      // 将样式添加到编辑器的 head 中
      editor.getDoc().head.appendChild(styleElm);
    });

    const api = register(editor);
    editor.plugins.customblock = api;

    registerCommands(editor);

    return {};
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Custom block plugin initialization failed:', error);
    throw error;
  }
};

export default (): void => {
  PluginManager.add('customblock', setup);
};