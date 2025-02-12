import Editor from 'tinymce/core/api/Editor';
import PluginManager from 'tinymce/core/api/PluginManager';

export default (): void => {
  PluginManager.add('customblock', (editor) => {
    editor.ui.registry.addButton('customblock', {
      icon: 'transform-image',
      tooltip: 'Custom Block',
      onAction: () => {
        editor.windowManager.open({
          title: 'Block Settings',
          body: {
            type: 'panel',
            items: [
              { type: 'colorinput', name: 'bgColor', label: 'Background Color' },
              { type: 'input', name: 'width', label: 'Width' },
              { type: 'input', name: 'height', label: 'Height' },
              { type: 'input', name: 'margin', label: 'Margin' },
              { type: 'input', name: 'padding', label: 'Padding' },
              { type: 'input', name: 'border', label: 'Border' },
              { type: 'input', name: 'boxShadow', label: 'Shadow' },
              { type: 'input', name: 'link', label: 'Link URL' },
              {
                type: 'listbox', name: 'display', label: 'Display', items: [
                  { value: 'block', text: 'Block' },
                  { value: 'inline-block', text: 'Inline Block' }
                ]
              }
            ]
          },
          onSubmit: (api) => {
            const data = api.getData();
            applyStyles(editor, data);
            api.close();
          }
        });
      }
    });
    const applyStyles = (editor: Editor, styles: any) => {
      editor.formatter.apply('customblock', { styles });
    };
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
  });
};