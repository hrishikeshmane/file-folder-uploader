'use client';

import { useState } from 'react';
import { FileItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Folder, File, Trash2 } from 'lucide-react';
import FilePreview from './FilePreview';

interface FileListProps {
  files: FileItem[];
  onNavigate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FileList({ files, onNavigate, onDelete }: FileListProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      onNavigate(file.id);
    } else {
      setSelectedFile(file);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div 
              className="flex items-center gap-2 flex-1 cursor-pointer"
              onClick={() => handleFileClick(item)}
            >
              {item.type === 'directory' ? (
                <Folder className="w-5 h-5 text-blue-500" />
              ) : (
                <File className="w-5 h-5 text-gray-500" />
              )}
              <span className="hover:text-blue-500">
                {item.name}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
      </div>

      <FilePreview
        isOpen={!!selectedFile}
        onClose={() => setSelectedFile(null)}
        file={selectedFile}
      />
    </>
  );
}