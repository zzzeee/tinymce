import Editor from 'tinymce/core/api/Editor';
import { BlobInfo } from 'tinymce/core/api/file/BlobCache';

type ImageUploadHandler = (blobInfo: BlobInfo, progress: (percent: number) => void) => Promise<string>;

const getImagesUploadHandler = (editor: Editor): ImageUploadHandler | undefined =>
  editor.options.get('images_upload_handler');

const getUploadUrl = (editor: Editor): string =>
  editor.options.get('images_upload_url') || '';

export const Options = {
  getImagesUploadHandler,
  getUploadUrl
};