import { useLocation } from "wouter";

interface MentionTextProps {
  text: string;
  className?: string;
}

export default function MentionText({ text, className = "" }: MentionTextProps) {
  const [, setLocation] = useLocation();

  // Parse text and identify @mentions and #hashtags
  const parseText = (text: string) => {
    // Combined regex to match @mentions and #hashtags
    const combinedRegex = /(@[a-zA-Z0-9_-]+)|(#[\w\u00c0-\u024f\u1e00-\u1eff]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index),
        });
      }

      if (match[1]) {
        // This is a mention (@username)
        parts.push({
          type: 'mention',
          content: match[1], // Full match including @
          handle: match[1].slice(1), // Handle without @
        });
      } else if (match[2]) {
        // This is a hashtag (#hashtag)
        parts.push({
          type: 'hashtag',
          content: match[2], // Full match including #
          hashtag: match[2], // Full hashtag with #
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex),
      });
    }

    return parts;
  };

  const parts = parseText(text);

  const handleMentionClick = (handle: string) => {
    // Navigate to the user's profile by handle
    setLocation(`/profile/${handle}`);
  };

  const handleHashtagClick = (hashtag: string) => {
    // Navigate to search page with hashtag query
    setLocation(`/search?q=${encodeURIComponent(hashtag)}`);
  };

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          return (
            <button
              key={index}
              onClick={() => handleMentionClick(part.handle)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline cursor-pointer font-medium transition-colors"
            >
              {part.content}
            </button>
          );
        }
        if (part.type === 'hashtag') {
          return (
            <button
              key={index}
              onClick={() => handleHashtagClick(part.hashtag)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline cursor-pointer font-medium transition-colors"
            >
              {part.content}
            </button>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
}