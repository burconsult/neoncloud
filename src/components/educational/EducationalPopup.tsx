import { useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { renderMarkdown } from '@/utils/markdownRenderer';
import './EducationalPopup.css';

export type PopupType = 'tip' | 'info' | 'warning' | 'error' | 'success';

interface EducationalPopupProps {
  type: PopupType;
  title: string;
  content: string | string[];
  onClose: () => void;
  onDismiss?: () => void;
  showCloseButton?: boolean;
}

export function EducationalPopup({
  type,
  title,
  content,
  onClose,
  onDismiss,
  showCloseButton = true,
}: EducationalPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Handle keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    // Auto-focus the popup for accessibility
    if (popupRef.current) {
      popupRef.current.focus();
    }
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'tip':
        return 'help';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  const renderContent = () => {
    if (Array.isArray(content)) {
      // If it's an array, join with newlines and render as markdown
      return renderMarkdown(content.join('\n'));
    }
    // Render string content as markdown
    return renderMarkdown(content);
  };

  return (
    <div className="popup-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <div
        ref={popupRef}
        className={`educational-popup educational-popup--${type}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <div className="popup-header">
          <div className="popup-header-content">
            <Icon name={getIcon()} size={24} className="popup-icon" aria-hidden={true} />
            <h3 id="popup-title" className="popup-title">{title}</h3>
          </div>
          {showCloseButton && (
            <button
              className="popup-close"
              onClick={onClose}
              aria-label="Close popup"
            >
              <Icon name="error" size={20} aria-hidden={true} />
            </button>
          )}
        </div>
        <div className="popup-body">
          <div className="popup-content">
            {renderContent()}
          </div>
        </div>
        <div className="popup-footer">
          {onDismiss && (
            <button className="popup-button popup-button--secondary" onClick={onDismiss}>
              Don't show again
            </button>
          )}
          <button className="popup-button popup-button--primary" onClick={onClose} autoFocus>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

