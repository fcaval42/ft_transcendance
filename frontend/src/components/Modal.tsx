import React from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-sm mx-4">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
        <div className="mb-8">{children}</div>
        {footer && <div className="flex gap-4 justify-center">{footer}</div>}
      </div>
    </div>
  );
};