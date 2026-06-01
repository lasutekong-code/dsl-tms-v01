"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type PhotoViewerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  imageUrl: string | null;
};

export function PhotoViewerDialog({ open, onOpenChange, title, imageUrl }: PhotoViewerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-2 sm:p-4">
        <DialogTitle className="pr-8 text-base font-semibold text-slate-900">{title}</DialogTitle>
        <div className="space-y-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={title}
              src={imageUrl}
              className="max-h-[70vh] w-full rounded-lg object-contain bg-slate-50"
            />
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
              이미지를 불러올 수 없습니다.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
