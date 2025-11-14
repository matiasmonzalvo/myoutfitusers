"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteLayoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutTitle: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function DeleteLayoutDialog({
  open,
  onOpenChange,
  layoutTitle,
  onConfirm,
  isSubmitting = false,
}: DeleteLayoutDialogProps) {
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-background w-96 p-4 gap-2">
        <DialogHeader className="mb-0">
          <DialogTitle className="text-xl font-bold text-foreground tracking-tighter">
            Delete Grid
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete "{layoutTitle}"? This action cannot
            be undone.
          </p>
        </div>

        <DialogFooter className="flex gap-2 mt-2">
          <button
            onClick={handleClose}
            className="cursor-pointer flex items-center space-x-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-0"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="cursor-pointer border px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-0 hover:opacity-80"
          >
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
