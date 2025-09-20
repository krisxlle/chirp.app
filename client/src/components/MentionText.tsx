import React from 'react';

interface MentionTextProps {
  text: string;
  onMentionPress?: (handle: string) => void;
}

export default function MentionText({ text, onMentionPress }: MentionTextProps) {
  // Simple mention detection - looks for @username patterns
  const parseText = (text: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add text before the mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }

      // Add the mention
      parts.push({
        type: 'mention',
        content: match[0],
        handle: match[1]
      });

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }

    return parts;
  };

  const parts = parseText(text);

  return (
    <span className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <span
              key={index}
              className="text-purple-600 hover:text-purple-800 cursor-pointer font-medium"
              onClick={() => onMentionPress?.(part.handle)}
            >
              {part.content}
            </span>
          );
        }
        return part.content;
      })}
    </span>
  );
}