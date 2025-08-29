import React, { useState, useMemo, useEffect } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';

const BlanksQuiz = ({ content, desc }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [showDescription, setShowDescription] = useState(false);

  const questions = useMemo(() => {
    if (!content) return [];
    return Object.entries(content).map(([question, answer]) => {
      const description = desc && desc[question] ? desc[question] : "No explanation available.";
      return { question, answer, description };
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
    setUserAnswer(answered[currentIndex + 1] ? answered[currentIndex + 1].answer : '');
    setCurrentIndex((prevIndex) => (prevIndex + 1) % questions.length);
  };

  const handlePrev = () => {
    setUserAnswer(answered[currentIndex - 1] ? answered[currentIndex - 1].answer : '');
    setCurrentIndex((prevIndex) => (prevIndex - 1 + questions.length) % questions.length);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answered[currentIndex]) return;

    const isCorrect = userAnswer.trim().toLowerCase() === questions[currentIndex].answer.toLowerCase();

    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    setAnswered(prev => ({ ...prev, [currentIndex]: { answer: userAnswer, isCorrect } }));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setScore(0);
    setAnswered({});
  };

  if (questions.length === 0) {
    return <div className="text-white">No fill-in-the-blanks quiz available.</div>;
  }

  const { question, answer, description } = questions[currentIndex];
  const answeredQuestion = answered[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-4 sm:p-6 bg-stone-800 rounded-2xl shadow-2xl relative">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-stone-300">Score: <span className="text-white">{score} / {questions.length}</span></h2>
        <p className="text-md sm:text-lg font-semibold text-stone-400">Question {currentIndex + 1} of {questions.length}</p>
      </div>

      <div className="w-full flex-grow flex flex-col justify-center">
        <div className="w-full flex flex-col items-center">
          <div className="text-2xl sm:text-3xl mb-8 text-center font-semibold text-white min-h-[100px] flex items-center justify-center">
            {question.split('_____').map((part, index, array) => (
              <React.Fragment key={index}>
                <ComplexTextDisplay text={part} />
                {index < array.length - 1 && <span className="font-bold text-4xl text-stone-400 mx-2">_____</span>}
              </React.Fragment>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={!!answeredQuestion}
              className={`w-full max-w-md p-3 bg-stone-700 border-2 rounded-lg text-center text-lg text-white transition-colors duration-300 shadow-inner ${
                answeredQuestion ? (answeredQuestion.isCorrect ? 'border-green-500' : 'border-red-500') : 'border-stone-600 focus:border-blue-500'
              }`}
            />
            <button
              type="submit"
              disabled={!!answeredQuestion}
              className="mt-6 px-8 py-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold disabled:opacity-50"
            >
              Submit
            </button>
          </form>
          {answeredQuestion && (
            <div className="mt-6 text-lg text-center">
              {answeredQuestion.isCorrect ? (
                <p className="text-green-400 font-bold">Correct!</p>
              ) : (
                <div className="text-red-400 font-bold">Incorrect. The correct answer is: <span className="font-extrabold"><ComplexTextDisplay text={answer} /></span></div>
              )}
              <div className={`mt-4 text-center text-stone-300 transition-opacity duration-500 ease-in-out ${showDescription ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-md font-semibold">Explanation:</p>
                <div className="text-sm mt-1"><ComplexTextDisplay text={description} /></div>
              </div>
            </div>
          )}
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

export default BlanksQuiz;
