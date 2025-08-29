import React from 'react';
import Flashcards from './Flashcards';
import MultiQuiz from './MultiQuiz';
import BlanksQuiz from './BlanksQuiz';
import Notes from './Notes';

const RightSplit = ({ data }) => {
  if (!data || !data.type) {
    return null;
  }

  const { type, content, desc } = data;

  const renderComponent = () => {
    switch (type) {
      case 'flashcard':
        return <Flashcards content={content} />;
      case 'multi_quiz':
        return <MultiQuiz content={content} desc={desc} />;
      case 'blanks_quiz':
        return <BlanksQuiz content={content} desc={desc} />;
      case 'notes':
        return <Notes content={content} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex-grow flex items-center justify-center bg-stone-900 text-white p-4 overflow-y-auto">
      {renderComponent()}
    </div>
  );
};

export default RightSplit;
