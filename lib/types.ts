export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'directory';
  content?: string;
  parentId: string | null;
  path: string;
  blobUrl?: string;
}

export interface FileUploadResponse {
  success: boolean;
  message: string;
  file?: FileItem;
}

export interface FileMetadata {
  items: FileItem[];
}