import React, { useState, useMemo, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';

const MultiQuiz = ({ content, desc }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [showDescription, setShowDescription] = useState(false);

  const questions = useMemo(() => {
    if (!content) return [];
    return Object.entries(content).map(([question, options]) => {
      const correctAnswer = options[0];
      const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
      const description = desc && desc[question] ? desc[question] : "No explanation available.";
      return { question, options: shuffledOptions, correctAnswer, description };
    });
  }, [content, desc]);

  useEffect(() => {
    if (answered[currentIndex]) {
      const timer = setTimeout(() => setShowDescription(true), 10);
      return () => clearTimeout(timer);
    } else {
      setShowDescription(false);
    }
  }, [answered, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + questions.length) % questions.length);
  };

  const handleAnswerSelect = (answer) => {
    if (answered[currentIndex]) return;

    const isCorrect = answer === questions[currentIndex].correctAnswer;
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    setAnswered(prev => ({...prev, [currentIndex]: { answer, isCorrect }}));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswered({});
  };

  if (questions.length === 0) {
    return <div className="text-white">No quiz available.</div>;
  }

  const { question, options, correctAnswer, description } = questions[currentIndex];
  const answeredQuestion = answered[currentIndex];

  return (
    <div className="w-full h-full max-w-3xl mx-auto flex flex-col items-center p-4 sm:p-6 bg-stone-800 rounded-2xl shadow-2xl relative">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-stone-300">Score: <span className="text-white">{score} / {questions.length}</span></h2>
        <p className="text-md sm:text-lg font-semibold text-stone-400">Question {currentIndex + 1} of {questions.length}</p>
      </div>

      <div className="w-full flex-grow flex flex-col justify-center">
        <div className="w-full">
          <div className="text-2xl sm:text-3xl font-bold mb-8 text-center text-white min-h-[100px] flex items-center justify-center">
            <ComplexTextDisplay text={question} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            {options.map((option, index) => {
              const isCorrect = option === correctAnswer;
              const isSelected = answeredQuestion && answeredQuestion.answer === option;
              let buttonClass = "p-4 rounded-lg transition-all duration-300 text-left text-white text-base sm:text-lg shadow-md ";
              
              if (answeredQuestion) {
                if (isCorrect) {
                  buttonClass += "bg-green-500/70 border-2 border-green-400 scale-105";
                } else if (isSelected) {
                  buttonClass += "bg-red-500/70 border-2 border-red-400";
                } else {
                  buttonClass += "bg-stone-700 opacity-50";
                }
              } else {
                buttonClass += "bg-stone-700 hover:bg-stone-600 hover:scale-105";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={!!answeredQuestion}
                  className={buttonClass}
                >
                  <ComplexTextDisplay text={option} />
                </button>
              );
            })}
          </div>
          <div className={`mt-6 text-center text-stone-300 transition-opacity duration-500 ease-in-out ${showDescription ? 'opacity-100' : 'opacity-0'}`}>
            {answeredQuestion && (
              <>
                <p className="text-lg font-semibold">Explanation:</p>
                <div className="text-base mt-2"><ComplexTextDisplay text={description} /></div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center w-full mt-8 pt-4 border-t border-stone-700">
        <button
          onClick={handlePrev}
          className="px-6 py-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold"
        >
          Prev
        </button>
        <button
          onClick={handleRestart}
          className="p-3 bg-stone-700 hover:bg-stone-600 rounded-full transition-colors text-white"
          aria-label="Restart Quiz"
        >
          <FiRefreshCw size={20} />
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MultiQuiz;
