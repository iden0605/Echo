import { useState, useEffect, useRef } from 'react';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';

const StreamedResponse = ({ text }) => {
  const charOutputSpeed = 1;
  
  const [displayedText, setDisplayedText] = useState('');
  const characterQueue = useRef([]);
  const prevTextRef = useRef('');
  const intervalRef = useRef(null);

  // Typing engine
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (characterQueue.current.length > 0) {
        const char = characterQueue.current.shift();
        setDisplayedText((prev) => prev + char);
      }
    }, charOutputSpeed);

    return () => clearInterval(intervalRef.current);
  }, []);

  // Queue manager
  useEffect(() => {
    if (text.length > prevTextRef.current.length) {
      const newCharacters = text.substring(prevTextRef.current.length);
      characterQueue.current.push(...newCharacters.split(''));
    }
    prevTextRef.current = text;
  }, [text]);

  return (
    <div className="whitespace-pre-wrap break-words">
      <ComplexTextDisplay text={displayedText} />
    </div>
  );
};

export default StreamedResponse;
