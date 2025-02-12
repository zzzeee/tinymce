import { Fun } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

import { Options } from '../api/Options';

interface DialogData {
  width: string;
  height: string;
  margin: string;
  padding: string;
  bgColor: string;
  borderWidth: string;
  borderStyle: string;
  borderColor: string;
  shadowX: string;
  shadowY: string;
  shadowBlur: string;
  shadowColor: string;
  backgroundSize: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundUrl: string;
  file?: File[];
}

const buildBlockStyles = (data: DialogData): string => {
  const styles: string[] = [];
  if (data.width) {
    styles.push(`width: ${data.width}`);
  }
  if (data.height) {
    styles.push(`height: ${data.height}`);
  }
  if (data.margin) {
    styles.push(`margin: ${data.margin}`);
  }
  if (data.padding) {
    styles.push(`padding: ${data.padding}`);
  }
  if (data.bgColor) {
    styles.push(`background-color: ${data.bgColor}`);
  }
  // 处理边框
  if (data.borderWidth && data.borderWidth !== '0px' && data.bgColor && data.borderStyle && data.borderStyle !== 'none') {
    styles.push(`border-width: ${data.borderWidth}`);
    styles.push(`border-style: ${data.borderStyle}`);
    styles.push(`border-color: ${data.borderColor}`);
  }
  // 处理阴影
  if (data.shadowX && data.shadowY && data.shadowBlur && data.shadowColor) {
    styles.push(`box-shadow: ${data.shadowX} ${data.shadowY} ${data.shadowBlur} ${data.shadowColor}`);
  }
  // 处理背景图
  if (data.backgroundUrl && data.backgroundUrl !== 'none') {
    styles.push(`background-image: url('${data.backgroundUrl}')`);
    if (data.backgroundSize) {
      styles.push(`background-size: ${data.backgroundSize}`);
    }
    if (data.backgroundPosition) {
      styles.push(`background-position: ${data.backgroundPosition}`);
    }
    if (data.backgroundRepeat) {
      styles.push(`background-repeat: ${data.backgroundRepeat}`);
    }
  }
  return styles.join('; ');
};

const insertBlock = (editor: Editor, data: DialogData): void => {
  const selectedNode = editor.selection.getNode();
  const customBlock = editor.dom.create('div', {
    class: 'custom-block',
    style: buildBlockStyles(data)
  }, '<br>');
  const nodeContent = selectedNode.textContent || '';
  // 插入区块
  if (selectedNode.nodeName === 'P' && !nodeContent.trim()) {
    editor.dom.replace(customBlock, selectedNode);
  } else {
    editor.insertContent(customBlock.outerHTML);
  }

  // 找到刚插入的区块并初始化它
  const insertedBlock = editor.getBody().querySelector('.custom-block:not(.custom-block-wrapper .custom-block)');
  if (insertedBlock && !insertedBlock.parentElement?.classList.contains('custom-block-wrapper')) {
    // 直接调用初始化函数
    editor.execCommand('mceCustomBlockInitialize', false, insertedBlock);
  }
};

const updateBlock = (editor: Editor, data: DialogData, block: HTMLElement): void => {
  const styles = buildBlockStyles(data);
  editor.execCommand('mceCustomBlockUpdate', false, { block, styles });
};

const openDialog = (editor: Editor, data?: DialogData, block?: HTMLElement): void => {
  const isNew = !block;

  const onSubmit = (api: Dialog.DialogInstanceApi<DialogData>) => {
    const dialogData = api.getData();
    if (block) {
      updateBlock(editor, dialogData, block);
    } else {
      insertBlock(editor, dialogData);
    }
    api.close();
  };

  // 处理文件上传
  const handleFileUpload = async (file: File, api: Dialog.DialogInstanceApi<DialogData>): Promise<void> => {
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
          api.setData({
            ...api.getData(),
            backgroundUrl: imageUrl
          });
          api.showTab('url');
        }
      }
    } catch (_error) {
      editor.notificationManager.open({
        text: '图片上传失败',
        type: 'error'
      });
    }
  };

  editor.windowManager.open<DialogData>({
    title: 'Custom Block',
    initialData: {
      bgColor: '#ffffff',
      borderColor: '#000000',
      backgroundSize: 'cover',
      backgroundPosition: 'center center',
      backgroundRepeat: 'no-repeat',
      width: '',
      height: '',
      margin: '',
      padding: '',
      borderWidth: '1px',
      borderStyle: 'solid',
      shadowX: '',
      shadowY: '',
      shadowBlur: '',
      shadowColor: '#000000',
      ...data
    },
    body: {
      type: 'tabpanel',
      tabs: [
        {
          title: 'General',
          name: 'general',
          items: [
            {
              type: 'colorinput',
              name: 'bgColor',
              label: 'Background Color'
            },
            {
              type: 'grid',
              columns: 2,
              items: [
                {
                  type: 'input',
                  name: 'width',
                  label: 'Width'
                },
                {
                  type: 'input',
                  name: 'height',
                  label: 'Height'
                }
              ]
            },
            {
              type: 'grid',
              columns: 2,
              items: [
                {
                  type: 'input',
                  name: 'margin',
                  label: 'Margin'
                },
                {
                  type: 'input',
                  name: 'padding',
                  label: 'Padding'
                }
              ]
            },
            {
              type: 'label',
              label: 'Border',
              items: []
            },
            {
              type: 'grid',
              columns: 3,
              items: [
                {
                  type: 'input',
                  name: 'borderWidth',
                  label: 'Width',
                  placeholder: '1px'
                },
                {
                  type: 'selectbox',
                  name: 'borderStyle',
                  label: 'Style',
                  items: [
                    { text: 'Solid', value: 'solid' },
                    { text: 'Dashed', value: 'dashed' },
                    { text: 'Dotted', value: 'dotted' }
                  ]
                },
                {
                  type: 'colorinput',
                  name: 'borderColor',
                  label: 'Color'
                }
              ]
            },
            {
              type: 'label',
              label: 'Shadow',
              items: []
            },
            {
              type: 'grid',
              columns: 4,
              items: [
                {
                  type: 'input',
                  name: 'shadowX',
                  label: 'X',
                  placeholder: '0px'
                },
                {
                  type: 'input',
                  name: 'shadowY',
                  label: 'Y',
                  placeholder: '0px'
                },
                {
                  type: 'input',
                  name: 'shadowBlur',
                  label: 'Blur',
                  placeholder: '5px'
                },
                {
                  type: 'colorinput',
                  name: 'shadowColor',
                  label: 'Color'
                }
              ]
            },
          ]
        },
        {
          title: 'Upload',
          name: 'upload',
          items: [
            {
              type: 'dropzone',
              name: 'file',
              label: 'Background Image'
            }
          ]
        },
        {
          title: 'URL',
          name: 'url',
          items: [
            {
              type: 'input',
              name: 'backgroundUrl',
              label: 'Image URL'
            },
            {
              type: 'selectbox',
              name: 'backgroundSize',
              label: 'Background Size',
              items: [
                { text: 'Cover', value: 'cover' },
                { text: 'Contain', value: 'contain' },
                { text: 'Auto', value: 'auto' },
                { text: 'Custom', value: 'custom' }
              ]
            },
            {
              type: 'input',
              name: 'customBackgroundSize',
              label: 'Custom Size',
              placeholder: '100% 100%'
            },
            {
              type: 'selectbox',
              name: 'backgroundPosition',
              label: 'Background Position',
              items: [
                { text: 'Center Center', value: 'center center' },
                { text: 'Left Top', value: 'left top' },
                { text: 'Right Bottom', value: 'right bottom' },
                { text: 'Custom', value: 'custom' }
              ]
            },
            {
              type: 'input',
              name: 'customBackgroundPosition',
              label: 'Custom Position',
              placeholder: '50% 50%'
            },
            {
              type: 'selectbox',
              name: 'backgroundRepeat',
              label: 'Background Repeat',
              items: [
                { text: 'No Repeat', value: 'no-repeat' },
                { text: 'Repeat', value: 'repeat' },
                { text: 'Repeat X', value: 'repeat-x' },
                { text: 'Repeat Y', value: 'repeat-y' }
              ]
            }
          ]
        }
      ]
    },
    buttons: [
      {
        type: 'cancel',
        text: 'Cancel'
      },
      {
        type: 'submit',
        text: isNew ? 'Insert' : 'Update',
        primary: true
      }
    ],
    onChange: (api, details) => {
      const dialogData = api.getData();
      if (details.name === 'file' && dialogData.file?.length) {
        handleFileUpload(dialogData.file[0], api).catch((_error) => {
          // console.error('File upload failed:', error);
        });
      }

      if (details.name === 'backgroundSize') {
        api.setEnabled('customBackgroundSize', dialogData.backgroundSize === 'custom');
      }
      if (details.name === 'backgroundPosition') {
        api.setEnabled('customBackgroundPosition', dialogData.backgroundPosition === 'custom');
      }
    },
    onSubmit
  });
};

export {
  openDialog,
  DialogData
};