import React, { useState, useEffect, useRef } from 'react';
import Flashcards from './Flashcards';
import MultiQuiz from './MultiQuiz';
import BlanksQuiz from './BlanksQuiz';
import Notes from './Notes';

const RightSplit = ({ data, setIsSplitVisible, scrollContainerRef }) => {
  const [relativeWidth, setRelativeWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;
      setIsMobile(screenWidth < 768);
      if (screenWidth >= 768) {
        const desiredWidth = (screenWidth * 800) / 1920;
        setRelativeWidth(desiredWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!data || !data.type) {
    return null;
  }

  const { type, content, desc } = data;

  const renderComponent = () => {
    switch (type) {
      case 'flashcard':
        return <Flashcards content={content} scrollContainerRef={scrollContainerRef} />;
      case 'multi_quiz':
        return <MultiQuiz content={content} desc={desc} scrollContainerRef={scrollContainerRef} />;
      case 'blanks_quiz':
        return <BlanksQuiz content={content} desc={desc} scrollContainerRef={scrollContainerRef} />;
      case 'notes':
        return <Notes content={content} />;
      default:
        return null;
    }
  };

  const isRelativeWidth = ['flashcard', 'multi_quiz', 'blanks_quiz'].includes(
    type
  );

  return (
    <div className="h-full w-full flex flex-col bg-stone-900 text-white">
      <div className="h-8 flex-shrink-0 flex items-center justify-end">
        <button
          onClick={() => setIsSplitVisible(false)}
          className="text-stone-400 hover:text-stone-200 z-30"
        >
          <svg
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
            height="30"
            width="30"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div className="flex-grow flex justify-center md:items-center p-1 md:p-5">
        <div
          className={`${
            !isRelativeWidth || isMobile ? 'w-full' : 'pb-20'
          } w-full flex-shrink-0`}
          style={
            isRelativeWidth && !isMobile ? { width: `${relativeWidth}px` } : {}
          }
        >
          {renderComponent()}
        </div>
      </div>
    </div>
  );
};

export default RightSplit;
