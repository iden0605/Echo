import { motion } from 'framer-motion';
import { useState, useEffect, useRef, memo } from 'react';

// React.memo prevents re-rendering if props (the character) don't change
const AnimatedCharacter = memo(({ char }) => {

  const charVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  return (
    <motion.span
      initial="hidden"
      animate="visible"
      variants={charVariants}
      transition={{ duration: 0.5 }}
    >
      {char}
    </motion.span>
  );
});

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
      {displayedText.split('').map((char, index) => (
        <AnimatedCharacter key={index} char={char} />
      ))}
    </div>
  );
};

export default StreamedResponse;
