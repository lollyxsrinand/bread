'use client';
import { useEffect } from 'react';

type ToastProps = {
  message: string;
  onClose: () => void;
};

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 bg-gray-800 text-white px-4 py-2 rounded shadow-md z-50 animate-fade-in">
      {message}
    </div>
  );
}
