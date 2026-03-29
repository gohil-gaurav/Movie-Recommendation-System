import { useEffect } from "react";

export default function Toast({ message, visible, onClose, duration = 2000 }) {
  useEffect(() => {
    if (!visible) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      onClose?.();
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [visible, onClose, duration]);

  return (
    <div className={visible ? "toast toast--visible" : "toast"} role="status" aria-live="polite">
      {message}
    </div>
  );
}
