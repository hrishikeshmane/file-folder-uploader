'use client';

import { useState, useEffect } from 'react';
import { FileItem } from '@/lib/types';
import { FileStore } from '@/lib/fileStore';
import FileBreadcrumb from './FileBreadcrumb';
import FileActions from './FileActions';
import FileList from './FileList';

export default function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  useEffect(() => {
    loadFiles();
  }, [currentPath]);

  const loadFiles = async () => {
    const parentId = currentPath.length ? currentPath[currentPath.length - 1] : null;
    const items = await FileStore.getChildren(parentId);
    setFiles(items);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles) return;

    for (const file of uploadedFiles) {
      if (!file.name.endsWith('.txt')) {
        alert('Only .txt files are allowed');
        continue;
      }

      const content = await file.text();
      const parentId = currentPath.length ? currentPath[currentPath.length - 1] : null;
      
      const fileItem: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'file',
        content,
        parentId,
        path: [...currentPath, file.name].join('/')
      };

      await FileStore.addFile(fileItem);
      await loadFiles();
    }
  };

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const folderCache = new Map<string, string>();
    const currentParentId = currentPath.length ? currentPath[currentPath.length - 1] : null;
    folderCache.set('', currentParentId);

    const processedFiles: { file: File; parentId: string }[] = [];

    // First pass: create all directories
    for (const file of Array.from(files)) {
      if (!file.name.endsWith('.txt')) continue;

      const pathParts = file.webkitRelativePath.split('/');
      let currentPath = '';

      // Process each directory in the path
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const parentPath = currentPath;
        currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

        if (!folderCache.has(currentPath)) {
          const parentId = folderCache.get(parentPath);
          const folderId = crypto.randomUUID();
          
          const folder: FileItem = {
            id: folderId,
            name: folderName,
            type: 'directory',
            parentId,
            path: currentPath
          };

          await FileStore.addFile(folder);
          folderCache.set(currentPath, folderId);
        }
      }

      // Queue the file for processing
      processedFiles.push({
        file,
        parentId: folderCache.get(currentPath) || currentParentId
      });
    }

    // Second pass: process all files
    for (const { file, parentId } of processedFiles) {
      const content = await file.text();
      const fileItem: FileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: 'file',
        content,
        parentId,
        path: file.webkitRelativePath
      };
      await FileStore.addFile(fileItem);
    }

    await loadFiles();
  };

  const handleDelete = async (id: string) => {
    await FileStore.deleteFile(id);
    await loadFiles();
  };

  const navigateToFolder = (id: string) => {
    setCurrentPath([...currentPath, id]);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentPath([]);
    } else {
      setCurrentPath(currentPath.slice(0, index + 1));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 space-y-4">
        <h1 className="text-2xl font-bold">File Explorer</h1>
        
        <FileBreadcrumb
          currentPath={currentPath}
          onNavigate={navigateToBreadcrumb}
          getPathItem={async (id) => await FileStore.getFileById(id)}
        />

        <FileActions
          onFileUpload={handleFileUpload}
          onFolderUpload={handleFolderUpload}
        />
      </div>

      <FileList
        files={files}
        onNavigate={navigateToFolder}
        onDelete={handleDelete}
      />
    </div>
  );
}