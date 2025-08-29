import React from 'react';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';

const Notes = ({ content }) => {
  if (!content || !content.text) {
    return <div className="text-white">No notes available.</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-stone-800 rounded-lg shadow-lg text-white h-full overflow-y-auto">
      <ComplexTextDisplay text={content.text} />
    </div>
  );
};

export default Notes;
