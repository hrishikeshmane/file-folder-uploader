'use client';

import { Button } from '@/components/ui/button';
import { Folder, Upload } from 'lucide-react';

interface FileActionsProps {
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFolderUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileActions({ onFileUpload, onFolderUpload }: FileActionsProps) {
  return (
    <div className="flex gap-4">
      <Button asChild variant="outline">
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".txt"
            multiple
            className="hidden"
            onChange={onFileUpload}
          />
          <Upload className="w-4 h-4 mr-2 inline" />
          Upload Files
        </label>
      </Button>

      <Button asChild variant="outline">
        <label className="cursor-pointer">
          <input
            type="file"
            // @ts-ignore - These attributes are valid but not in TypeScript definitions
            directory=""
            webkitdirectory=""
            mozdirectory=""
            className="hidden"
            onChange={onFolderUpload}
          />
          <Folder className="w-4 h-4 mr-2 inline" />
          Upload Folder
        </label>
      </Button>
    </div>
  );
}