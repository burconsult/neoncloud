import React from 'react';

/**
 * Simple markdown renderer for educational content
 * Supports: **bold**, bullet lists (-), numbered lists, line breaks
 */
export function renderMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Split by double newlines to get paragraphs/blocks
  const blocks = text.split(/\n\n+/);
  const result: React.ReactNode[] = [];
  let key = 0;

  blocks.forEach((block) => {
    const trimmed = block.trim();
    if (!trimmed) return;

    const lines = trimmed.split('\n').map(l => l.trim()).filter(l => l);
    
    // Check if this block contains a list (starts with - or number.)
    const listStartIndex = lines.findIndex(line => 
      line.startsWith('-') || /^\d+\.\s/.test(line)
    );

    if (listStartIndex > 0) {
      // Has content before the list - render as paragraph first
      const beforeList = lines.slice(0, listStartIndex).join(' ');
      if (beforeList) {
        result.push(
          <p key={key++} className="popup-content-line">
            {renderInlineMarkdown(beforeList)}
          </p>
        );
      }
    }

    // Check if it's a bullet list
    if (listStartIndex >= 0 && lines[listStartIndex].startsWith('-')) {
      const listItems = lines.slice(listStartIndex).filter(line => line.startsWith('-'));
      result.push(
        <ul key={key++} className="popup-list">
          {listItems.map((item, iIndex) => {
            const content = item.replace(/^-\s+/, '').trim();
            return (
              <li key={iIndex} className="popup-list-item">
                {renderInlineMarkdown(content)}
              </li>
            );
          })}
        </ul>
      );
    }
    // Check if it's a numbered list
    else if (listStartIndex >= 0 && /^\d+\.\s/.test(lines[listStartIndex])) {
      const listItems = lines.slice(listStartIndex).filter(line => /^\d+\.\s/.test(line));
      result.push(
        <ol key={key++} className="popup-list popup-list--numbered">
          {listItems.map((item, iIndex) => {
            const content = item.replace(/^\d+\.\s+/, '').trim();
            return (
              <li key={iIndex} className="popup-list-item">
                {renderInlineMarkdown(content)}
              </li>
            );
          })}
        </ol>
      );
    }
    // Regular paragraph (no list found)
    else if (listStartIndex === -1) {
      result.push(
        <p key={key++} className="popup-content-line">
          {renderInlineMarkdown(trimmed)}
        </p>
      );
    }
  });

  return <>{result}</>;
}

/**
 * Render inline markdown (bold, emphasis, etc.)
 */
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: (string | React.ReactElement)[] = [];
  let currentIndex = 0;
  let key = 0;

  // Process **bold** text
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;
  let lastIndex = 0;

  while ((match = boldRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        parts.push(beforeText);
      }
    }

    // Add the bold text
    parts.push(
      <strong key={key++} className="popup-bold">
        {match[1]}
      </strong>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no bold text was found, return original text
  if (parts.length === 0) {
    return text;
  }

  return <>{parts}</>;
}

