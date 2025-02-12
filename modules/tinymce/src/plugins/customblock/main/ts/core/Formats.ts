import Editor from 'tinymce/core/api/Editor';

const registerFormats = (editor: Editor): void => {
  editor.formatter.register('customblock', {
    selector: 'div',
    styles: {
      backgroundColor: '%value',
      width: '%value',
      height: '%value',
      margin: '%value',
      padding: '%value',
      border: '%value',
      boxShadow: '%value',
      display: '%value'
    }
  });
};

export {
  registerFormats
};