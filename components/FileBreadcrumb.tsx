'use client';

import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileItem } from '@/lib/types';
import { useEffect, useState } from 'react';

interface FileBreadcrumbProps {
  currentPath: string[];
  onNavigate: (index: number) => void;
  getPathItem: (id: string) => Promise<FileItem | undefined>;
}

export default function FileBreadcrumb({ currentPath, onNavigate, getPathItem }: FileBreadcrumbProps) {
  const [pathItems, setPathItems] = useState<(FileItem | undefined)[]>([]);

  useEffect(() => {
    const loadPathItems = async () => {
      const items = await Promise.all(currentPath.map(id => getPathItem(id)));
      setPathItems(items);
    };
    loadPathItems();
  }, [currentPath, getPathItem]);

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Button
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-normal"
        onClick={() => onNavigate(-1)}
      >
        <Home className="h-4 w-4" />
      </Button>
      {pathItems.map((item, index) => (
        <div key={currentPath[index]} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 font-normal"
            onClick={() => onNavigate(index)}
          >
            {item?.name || 'Unknown'}
          </Button>
        </div>
      ))}
    </nav>
  );
}