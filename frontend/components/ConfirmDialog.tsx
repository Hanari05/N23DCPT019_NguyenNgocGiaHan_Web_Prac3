'use client';

import Dialog from './Dialog';

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog title={title} onClose={onClose}>
      <p className="text-sm text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          autoFocus
          onClick={onClose}
          className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:bg-page"
        >
          Giữ lại
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
