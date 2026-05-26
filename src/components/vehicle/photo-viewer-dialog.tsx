'use client';

import * as React from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface PhotoViewerDialogProps {
  open: boolean;
  title: string;
  imageUrl: string | null;
  onOpenChange: (open: boolean) => void;
}

export function PhotoViewerDialog({
  open,
  title,
  imageUrl,
  onOpenChange,
}: PhotoViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden p-4 sm:p-6">
        <DialogHeader className="mb-2 flex flex-row items-center justify-between gap-2">
          <DialogTitle className="text-base font-semibold sm:text-lg">
            {title}
          </DialogTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        </DialogHeader>
        <div className="flex items-center justify-center">
          <div className="relative w-full max-h-[70vh]">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={title}
                className="h-full w-full max-h-[70vh] rounded-md border bg-black/5 object-contain"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                사진을 불러올 수 없습니다.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

