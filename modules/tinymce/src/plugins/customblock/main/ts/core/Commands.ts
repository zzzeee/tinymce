import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { SetContentEvent, GetContentEvent } from 'tinymce/core/api/EventTypes';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { Options } from '../api/Options';
import { openDialog } from '../ui/Dialog';

// 提取获取样式数据的函数
const getStyleData = (element: HTMLElement) => {
  const styles = window.getComputedStyle(element);
  // 处理 boxShadow 的特殊情况
  let shadowX = '', shadowY = '', shadowBlur = '', shadowColor = 'transparent';
  const boxShadow = styles.boxShadow;
  if (boxShadow && boxShadow !== 'none' && boxShadow !== '') {
    // 先处理括号内的内容，去掉括号内的空格
    const processedBoxShadow = boxShadow.replace(/\((.*?)\)/g, (match) => match.replace(/\s+/g, ''));
    const parts = processedBoxShadow.split(/\s+/);
    // 判断颜色位置：如果第一个值是颜色值（包含rgb、rgba、#或颜色关键字）
    if (parts[0].match(/(^#|^rgb|^rgba|^hsl|^hsla|^[a-zA-Z])/)) {
      [ shadowColor, shadowX, shadowY, shadowBlur ] = parts;
    } else {
      // 颜色在最后
      [ shadowX, shadowY, shadowBlur, shadowColor ] = parts;
    }
  }
  const stylesData: any = {
    width: element.style.width || '',
    height: element.style.height || '',
    margin: element.style.margin || '',
    padding: element.style.padding || '',
    bgColor: styles.backgroundColor || '',
    borderWidth: styles.borderWidth || '',
    borderStyle: styles.borderStyle || '',
    borderColor: styles.borderColor || '',
  };
  if (shadowX && shadowY && shadowBlur && shadowColor) {
    stylesData.shadowX = shadowX;
    stylesData.shadowY = shadowY;
    stylesData.shadowBlur = shadowBlur;
    stylesData.shadowColor = shadowColor;
  }
  if (styles.backgroundImage && styles.backgroundImage !== 'none') {
    stylesData.backgroundUrl = styles.backgroundImage.replace(/^url\(['"](.+)['"]\)$/, '$1');
    stylesData.backgroundSize = styles.backgroundSize || '';
    stylesData.backgroundPosition = styles.backgroundPosition || '';
    stylesData.backgroundRepeat = styles.backgroundRepeat || '';
  }
  return stylesData;
};

// 提取创建区块工具栏的函数
const createBlockToolbar = (editor: Editor, htmlBlock: HTMLElement, wrapper: HTMLElement) => {
  // 创建图标容器
  const iconContainer = editor.dom.create('div', {
    class: 'custom-block-icons',
    contenteditable: 'false'
  });

  // 编辑图标
  const editButton = editor.dom.create('div', {
    class: 'custom-block-icon',
    title: '编辑区块'
  }, `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
    </svg>
  `);

  // 删除图标
  const deleteButton = editor.dom.create('div', {
    class: 'custom-block-icon',
    title: '删除区块'
  }, `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
    </svg>
  `);

  // 上方添加空行图标
  const addLineAboveButton = editor.dom.create('div', {
    class: 'custom-block-icon',
    title: '在上方添加空行'
  }, `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      <path fill="currentColor" d="M3 3h18v2H3z"/>
    </svg>
  `);

  // 下方添加空行图标
  const addLineBelowButton = editor.dom.create('div', {
    class: 'custom-block-icon',
    title: '在下方添加空行'
  }, `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
      <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      <path fill="currentColor" d="M3 19h18v2H3z"/>
    </svg>
  `);

  // 编辑图标点击事件
  editButton.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const currentData = getStyleData(htmlBlock);
    openDialog(editor, currentData, htmlBlock);
  });

  // 删除图标点击事件
  deleteButton.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wrapper.remove();
  });

  // 添加空行点击事件
  addLineAboveButton.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const p = editor.dom.create('p', {}, '<br>');
    wrapper.parentNode?.insertBefore(p, wrapper);
    editor.selection.setCursorLocation(p, 0);
  });

  addLineBelowButton.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const p = editor.dom.create('p', {}, '<br>');
    wrapper.parentNode?.insertBefore(p, wrapper.nextSibling);
    editor.selection.setCursorLocation(p, 0);
  });

  // 将所有图标添加到容器中
  iconContainer.appendChild(editButton);
  iconContainer.appendChild(deleteButton);
  iconContainer.appendChild(addLineAboveButton);
  iconContainer.appendChild(addLineBelowButton);

  return iconContainer;
};

const registerCommands = (editor: Editor): void => {
  // 确保区块内容可编辑
  const initializeBlock = (block: HTMLElement) => {
    // 先移除已存在的 wrapper（如果有）
    const existingWrapper = block.closest('.custom-block-wrapper');
    if (existingWrapper) {
      existingWrapper.parentNode?.insertBefore(block, existingWrapper);
      existingWrapper.remove();
    }

    // 创建新的 wrapper
    const wrapper = editor.dom.create('div', {
      class: 'custom-block-wrapper'
    });

    block.parentNode?.insertBefore(wrapper, block);
    wrapper.appendChild(block);

    const toolbar = createBlockToolbar(editor, block, wrapper);
    wrapper.appendChild(toolbar);

    wrapper.addEventListener('mousedown', (e: MouseEvent) => {
      e.stopPropagation();
      editor.getBody().querySelectorAll('.custom-block-wrapper').forEach((w) => {
        w.classList.remove('selected');
      });
      wrapper.classList.add('selected');
    });
  };

  // 添加命令
  editor.addCommand('mceCustomBlockUpdate', (ui: boolean, value: any) => {
    const block = value?.block as HTMLElement;
    const styles = value?.styles as string;
    if (block && styles) {
      // 更新当前区块样式
      updateBlockStyles(block, styles);
      // 获取当前源码内容
      const sourceContent = editor.getContent({ source_view: true });
      const div = document.createElement('div');
      div.innerHTML = sourceContent;
      // 更新源码中对应区块的样式
      const sourceBlocks = div.querySelectorAll('.custom-block');
      sourceBlocks.forEach((sourceBlock) => {
        if (sourceBlock.innerHTML === block.innerHTML) {
          updateBlockStyles(sourceBlock as HTMLElement, styles);
        }
      });
      // 更新源码内容
      editor.setContent(div.innerHTML, { source_view: true });
      // 重新获取并初始化区块
      setTimeout(() => {
        editor.getBody().querySelectorAll('.custom-block').forEach((b) => {
          if (!b.parentElement?.classList.contains('custom-block-wrapper')) {
            initializeBlock(b as HTMLElement);
          }
        });
      }, 0);
    }
  });

  // 在切换到源码模式前处理内容
  editor.on('GetContent', (e: EditorEvent<GetContentEvent>) => {
    if (e.source === 'source') {
      const div = editor.dom.create('div');
      div.innerHTML = e.content;
      // 移除所有工具栏和包装器，只保留区块
      div.querySelectorAll('.custom-block-wrapper').forEach((wrapper) => {
        const block = wrapper.querySelector('.custom-block');
        if (block) {
          wrapper.parentNode?.insertBefore(block, wrapper);
          wrapper.remove();
        }
      });
      div.querySelectorAll('.custom-block-icons').forEach((icons) => icons.remove());
      e.content = div.innerHTML;
    }
  });

  // 添加命令
  editor.addCommand('mceCustomBlockInitialize', (_ui: boolean, block: HTMLElement) => {
    if (block) {
      initializeBlock(block);
    }
  });

  editor.addCommand('mceCustomBlock', () => {
    const defaultData = {
      width: '',
      height: '',
      margin: '',
      padding: '',
      bgColor: '',
      borderWidth: '',
      borderStyle: '',
      borderColor: '',
      shadowX: '0px',
      shadowY: '0px',
      shadowBlur: '0px',
      shadowColor: 'transparent',
      backgroundSize: '',
      backgroundPosition: '',
      backgroundRepeat: '',
      backgroundUrl: ''
    };

    const currentNode = editor.selection.getNode();
    const parentWrapper = currentNode.closest('.custom-block-wrapper');
    if (parentWrapper) {
      defaultData.margin = '0.5em 0';
    }
    openDialog(editor, defaultData);
  });

  // 在编辑器初始化时初始化所有区块
  editor.on('init', () => {
    const blocks = editor.getBody().querySelectorAll('.custom-block');
    blocks.forEach((block) => {
      if (!block.parentElement?.classList.contains('custom-block-wrapper')) {
        initializeBlock(block as HTMLElement);
      }
    });
  });

  // 在内容设置后初始化新区块
  editor.on('SetContent', () => {
    const blocks = editor.getBody().querySelectorAll('.custom-block');
    blocks.forEach((block) => {
      if (!block.parentElement?.classList.contains('custom-block-wrapper')) {
        initializeBlock(block as HTMLElement);
      }
    });
  });

  // 处理新创建的区块
  editor.on('NewBlock', (e: EditorEvent<any>) => {
    const target = e.target as HTMLElement;
    if (target?.classList?.contains('custom-block')) {
      initializeBlock(target);
    }
  });

  // 添加点击处理
  editor.on('mousedown', (e: EditorEvent<MouseEvent>) => {
    const target = e.target as HTMLElement;
    const wrapper = target.closest('.custom-block-wrapper');
    if (wrapper) {
      e.preventDefault();
      e.stopPropagation();
      // 移除所有区块的选中状态
      editor.getBody().querySelectorAll('.custom-block-wrapper').forEach((w) => {
        w.classList.remove('selected');
      });
      // 添加当前区块的选中状态
      wrapper.classList.add('selected');
    }
  });

  // 处理回车事件
  editor.on('keydown', (e: EditorEvent<KeyboardEvent>) => {
    const node = editor.selection.getNode();
    const customBlock = node.closest('.custom-block');
    if (customBlock && e.keyCode === 13) { // Enter key
      // 如果直接在区块内（不在其他插件内），处理为软回车
      if (node === customBlock || node.parentNode === customBlock) {
        e.preventDefault();
        editor.execCommand('InsertLineBreak');
        return false;
      }
    }
    return true;
  });

  // 处理拖拽
  editor.on('dragstart', (e: EditorEvent<DragEvent>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('custom-block')) {
      e.preventDefault();
      return false;
    }
    return true;
  });

  const handleDropUpload = async (file: File, customBlock: HTMLElement): Promise<void> => {
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const blobInfo = editor.editorUpload.blobCache.create({
        blob: file,
        base64: base64.split(',')[1],
        name: file.name
      });

      const uploadHandler = Options.getImagesUploadHandler(editor);
      if (uploadHandler) {
        const imageUrl = await uploadHandler(blobInfo, Fun.noop);
        if (imageUrl) {
          const currentData = getStyleData(customBlock);
          currentData.backgroundUrl = imageUrl;
          // 更新区块样式
          customBlock.style.backgroundImage = `url('${imageUrl}')`;
          customBlock.style.backgroundSize = currentData.backgroundSize || 'cover';
          customBlock.style.backgroundPosition = currentData.backgroundPosition || 'center';
          customBlock.style.backgroundRepeat = currentData.backgroundRepeat || 'no-repeat';
        }
      }
    } catch (error) {
      editor.notificationManager.open({
        text: `图片上传失败: ${error}`,
        type: 'error'
      });
    }
  };

  const handlePasteUpload = async (file: File, parentBlock: HTMLElement): Promise<void> => {
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      const base64 = await base64Promise;

      const blobInfo = editor.editorUpload.blobCache.create({
        blob: file,
        base64: base64.split(',')[1],
        name: `pasted_${Date.now()}.png`
      });

      const uploadHandler = Options.getImagesUploadHandler(editor);
      if (uploadHandler) {
        const imageUrl = await uploadHandler(blobInfo, Fun.noop);
        if (imageUrl) {
          const currentData = getStyleData(parentBlock);
          currentData.backgroundUrl = imageUrl;
          // 更新区块样式
          parentBlock.style.backgroundImage = `url('${imageUrl}')`;
          parentBlock.style.backgroundSize = currentData.backgroundSize || 'cover';
          parentBlock.style.backgroundPosition = currentData.backgroundPosition || 'center';
          parentBlock.style.backgroundRepeat = currentData.backgroundRepeat || 'no-repeat';
        }
      }
    } catch (error) {
      editor.notificationManager.open({
        text: `图片上传失败: ${error}`,
        type: 'error'
      });
    }
  };

  editor.on('drop', (e: EditorEvent<DragEvent>) => {
    const target = e.target as HTMLElement;
    const customBlock = target.closest('.custom-block') as HTMLElement;
    if (customBlock && e.dataTransfer?.files?.length) {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleDropUpload(file, customBlock).catch((_error) => {
          //   console.error('Drop upload failed:', error);
        });
      }
      return false;
    }
    return true;
  });

  editor.on('paste', (e: EditorEvent<ClipboardEvent>) => {
    const currentNode = editor.selection.getNode();
    const parentBlock = currentNode.closest('.custom-block') as HTMLElement;
    if (parentBlock) {
      const items = e.clipboardData?.items;
      if (items) {
        Array.from(items).forEach((item) => {
          if (item.type.indexOf('image') !== -1) {
            e.preventDefault();
            const file = item.getAsFile();
            if (file) {
              handlePasteUpload(file, parentBlock).catch((_error) => {
                // console.error('Paste upload failed:', error);
              });
            }
          }
        });
      }
    }
  });

  // 从源码模式切换回来时重新初始化区块
  editor.on('BeforeSetContent', (e: EditorEvent<SetContentEvent>) => {
    if (e.source === 'source') {
      window.setTimeout(() => {
        const blocks = editor.getBody().querySelectorAll<HTMLElement>('.custom-block');
        // 使用显式的 Array.from 替代 NodeList.forEach
        Array.from(blocks).forEach((block) => {
          if (
            block instanceof window.HTMLElement && // 显式使用 window 对象
            !block.parentElement?.classList.contains('custom-block-wrapper')
          ) {
            initializeBlock(block);
          }
        });
      }, 0);
    }
  });

  // 在序列化内容时处理区块
  editor.on('PreProcess', (e) => {
    const dom = editor.dom;
    const blocks = e.node.querySelectorAll('.custom-block-wrapper');
    blocks.forEach((wrapper) => {
      const block = wrapper.querySelector('.custom-block');
      if (block) {
        // 移除包装器，保留原始区块
        dom.remove(wrapper, true); // true 表示保留子元素
        e.node.appendChild(block);
      }
    });

    // 移除所有工具栏
    const toolbars = e.node.querySelectorAll('.custom-block-icons');
    toolbars.forEach((toolbar) => {
      dom.remove(toolbar);
    });
  });

  // 在反序列化内容时处理区块
  editor.on('PostProcess', (e) => {
    if (e.content) {
      // 使用正则表达式移除工具栏和包装器的 HTML
      e.content = e.content.replace(/<div class="custom-block-icons"[^>]*>.*?<\/div>/g, '');
      e.content = e.content.replace(/<div class="custom-block-wrapper"[^>]*>([\s\S]*?)<\/div>/g, '$1');
    }
  });

  // 更新区块样式的函数
  const updateBlockStyles = (block: HTMLElement, styles: string) => {
    editor.dom.setAttrib(block, 'style', styles);
  };
};

export {
  registerCommands
};