import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

type AppModalProps = {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'default' | 'wide';
};

const AppModal: React.FC<AppModalProps> = ({ title, onClose, children, size = 'default' }) => {
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
    <div className="app-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="app-modal__backdrop" aria-label="Dialog schliessen" onClick={onClose} />
      <div className={`app-modal__panel${size === 'wide' ? ' app-modal__panel--wide' : ''}`}>
        <div className="app-modal__header">
          <h2 className="h5 mb-0">{title}</h2>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
            Schliessen
          </button>
        </div>
        <div className="app-modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default AppModal;