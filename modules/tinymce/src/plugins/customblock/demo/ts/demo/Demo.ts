import { TinyMCE } from 'tinymce/core/api/PublicApi';

declare let tinymce: TinyMCE;

// console.log('customblock 000');
export default (): void => {
//   console.log('customblock 111');
  tinymce.init({
    selector: 'textarea#editor',
    plugins: 'customblock',
    toolbar: 'bullist numlist | customblock',
    height: 600
  });
};
