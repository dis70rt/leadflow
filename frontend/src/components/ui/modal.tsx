"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: string;
  children: React.ReactNode;
  wide?: boolean;
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className={`modal ${wide ? "modal-wide" : ""}`}>
          <div className="modal-header">
            <div>
              <Dialog.Title className="modal-title">{title}</Dialog.Title>
              <Dialog.Description className="modal-description">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
