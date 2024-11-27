import { FileItem, FileMetadata } from './types';
import { del, list, put } from '@vercel/blob';

export class FileStore {
  private static readonly METADATA_KEY = 'file-explorer-metadata.json';

  private static async getMetadata(): Promise<FileMetadata> {
    try {
      const { blobs } = await list();
      const metadataBlob = blobs.find(blob => blob.pathname === this.METADATA_KEY);
      
      if (metadataBlob) {
        const response = await fetch(metadataBlob.url);
        return await response.json();
      }
    } catch (error) {
      console.error('Error fetching metadata:', error);
    }
    
    return { items: [] };
  }

  private static async saveMetadata(metadata: FileMetadata): Promise<void> {
    try {
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      await put(this.METADATA_KEY, blob, { access: 'public' });
    } catch (error) {
      console.error('Error saving metadata:', error);
    }
  }

  static async getFiles(): Promise<FileItem[]> {
    const metadata = await this.getMetadata();
    return metadata.items;
  }

  static async addFile(file: FileItem): Promise<void> {
    const metadata = await this.getMetadata();
    
    if (file.type === 'file' && file.content) {
      const blob = new Blob([file.content], { type: 'text/plain' });
      const { url } = await put(file.path, blob, { access: 'public' });
      file.blobUrl = url;
      delete file.content; // Don't store content in metadata
    }
    
    metadata.items.push(file);
    await this.saveMetadata(metadata);
  }

  static async deleteFile(id: string): Promise<void> {
    const metadata = await this.getMetadata();
    const filesToDelete = metadata.items.filter(
      f => f.id === id || f.path.startsWith(`${id}/`)
    );
    
    // Delete blobs for files
    for (const file of filesToDelete) {
      if (file.type === 'file') {
        try {
          await del(file.path);
        } catch (error) {
          console.error(`Error deleting blob for ${file.path}:`, error);
        }
      }
    }
    
    metadata.items = metadata.items.filter(
      f => f.id !== id && !f.path.startsWith(`${id}/`)
    );
    
    await this.saveMetadata(metadata);
  }

  static async getChildren(parentId: string | null): Promise<FileItem[]> {
    const files = await this.getFiles();
    return files.filter(f => f.parentId === parentId);
  }

  static async getFileById(id: string): Promise<FileItem | undefined> {
    const files = await this.getFiles();
    return files.find(f => f.id === id);
  }

  static async getFileContent(file: FileItem): Promise<string> {
    if (!file.blobUrl) {
      throw new Error('File URL not found');
    }
    
    const response = await fetch(file.blobUrl);
    return await response.text();
  }
}