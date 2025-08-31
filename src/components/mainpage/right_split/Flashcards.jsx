import React, { useState } from 'react';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';

const Flashcards = ({ content }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const flashcards = Object.entries(content).map(([question, answer]) => ({ question, answer }));

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + flashcards.length) % flashcards.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  if (flashcards.length === 0) {
    return <div className="text-white">No flashcards available.</div>;
  }

  const { question, answer } = flashcards[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
      <div
        className={`relative w-full h-80 bg-stone-800 rounded-lg shadow-lg p-6 cursor-pointer transition-transform duration-100 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        onClick={handleFlip}
      >
        <div className="absolute inset-0 w-full h-full flex items-center justify-center backface-hidden">
          <div className="text-lg sm:text-xl text-center"><ComplexTextDisplay text={question} /></div>
        </div>
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-stone-700 rounded-lg backface-hidden rotate-y-180">
          <div className="text-lg sm:text-xl text-center"><ComplexTextDisplay text={answer} /></div>
        </div>
      </div>
      <div className="flex justify-between w-full mt-6">
        <button
          onClick={handlePrev}
          className="px-4 py-2 text-sm sm:text-base bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
        >
          Prev
        </button>
        <div className="text-base sm:text-lg">{`${currentIndex + 1} / ${flashcards.length}`}</div>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm sm:text-base bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Flashcards;
