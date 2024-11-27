'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileStore } from "@/lib/fileStore";
import { FileItem } from "@/lib/types";
import { useEffect, useState } from "react";

interface FilePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileItem | null;
}

export default function FilePreview({ isOpen, onClose, file }: FilePreviewProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      if (file && file.type === 'file') {
        setLoading(true);
        try {
          const content = await FileStore.getFileContent(file);
          setContent(content);
        } catch (error) {
          console.error('Error loading file content:', error);
          setContent('Error loading file content');
        } finally {
          setLoading(false);
        }
      }
    };

    if (isOpen && file) {
      loadContent();
    }
  }, [isOpen, file]);

  if (!file) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh]">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full mt-4">
          <pre className="text-sm whitespace-pre-wrap p-4 bg-muted rounded-md">
            {loading ? 'Loading...' : content || 'No content available'}
          </pre>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}