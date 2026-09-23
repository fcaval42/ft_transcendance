import { useEffect } from "react";

interface ToastType {
    message: string;
    type: "success" | "error";
    onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastType) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === "success" ? "bg-green-500" : "bg-red-500"

    return (
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 ${bgColor} text-white
      px-6 py-3 rounded-lg shadow-lg flex items-center gap-2`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-xl font-bold hover:opacity-70">×</button>
    </div>
  );
};
