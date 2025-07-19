import { useState, useEffect } from 'react';

export default function useTypingEffect(fullText, speed = 20) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    if (!fullText) return;

    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText[i]);
      i++;
      if (i >= fullText.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [fullText, speed]);

  return displayedText;
}
