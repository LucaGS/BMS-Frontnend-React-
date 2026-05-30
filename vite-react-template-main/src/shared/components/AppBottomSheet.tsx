import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type AppBottomSheetProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const AppBottomSheet: React.FC<AppBottomSheetProps> = ({ title, onClose, children }) => {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return undefined;
    }

    document.body.classList.add('app-modal-open');

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.classList.remove('app-modal-open');
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="app-sheet" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="app-sheet__backdrop" aria-label="Schliessen" onClick={onClose} />
      <div className="app-sheet__panel">
        <div className="app-sheet__header">
          <h2 className="h6 mb-0">{title}</h2>
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
            Schliessen
          </button>
        </div>
        <div className="app-sheet__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default AppBottomSheet;
