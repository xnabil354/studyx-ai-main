// components/AutoTypingText.tsx
import React, { useState, useEffect } from 'react';

interface AutoTypingTextProps {
  text: string;
  speed?: number;
}

const AutoTypingText: React.FC<AutoTypingTextProps> = ({ text, speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => clearInterval(typingInterval);
  }, [text, speed]);

  return <p className="text-sm text-gray-500">{displayedText}</p>;
};

export default AutoTypingText;