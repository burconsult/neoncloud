import React from 'react';
import { Email } from '@/types/email';
import { renderMarkdown } from './markdownRenderer';
import './emailRenderer.css';

/**
 * Render email content with proper formatting
 */
export function renderEmailContent(email: Email): React.ReactNode {
  return (
    <div className="email-content">
      {/* Email Header */}
      <div className="email-header">
        <div className="email-header-row">
          <span className="email-header-label">From:</span>
          <span className="email-header-value">{email.from}</span>
        </div>
        <div className="email-header-row">
          <span className="email-header-label">To:</span>
          <span className="email-header-value">{email.to}</span>
        </div>
        <div className="email-header-row">
          <span className="email-header-label">Subject:</span>
          <span className="email-header-value email-header-subject">{email.subject}</span>
        </div>
        <div className="email-header-row">
          <span className="email-header-label">Date:</span>
          <span className="email-header-value">{new Date(email.timestamp).toLocaleString()}</span>
        </div>
      </div>

      {/* Email Body with Markdown */}
      <div className="email-body">
        {renderMarkdown(email.body)}
      </div>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <div className="email-attachments">
          <div className="email-attachments-title">Attachments:</div>
          <ul className="email-attachments-list">
            {email.attachments.map((attachment, index) => (
              <li key={index} className="email-attachment-item">
                <span className="email-attachment-icon">📎</span>
                <span className="email-attachment-name">{attachment.filename}</span>
                <span className={`email-attachment-status ${attachment.decryptedContent ? 'decrypted' : 'encrypted'}`}>
                  {attachment.decryptedContent ? '[Decrypted]' : '[Encrypted]'}
                </span>
              </li>
            ))}
          </ul>
          <div className="email-attachments-note">
            Attachments have been saved to your Documents folder.
          </div>
        </div>
      )}
    </div>
  );
}

