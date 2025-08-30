import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';

const BlanksQuiz = ({ content, desc, scrollContainerRef }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [unlockedExplanation, setUnlockedExplanation] = useState({});
  const [maxHeight, setMaxHeight] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);
  const questionRefs = useRef([]);

  const questions = useMemo(() => {
    if (!content) return [];
    return Object.entries(content).map(([question, answer]) => {
      const description = desc && desc[question] ? desc[question] : "No explanation available.";
      return { question, answer, description };
    });
  }, [content, desc]);

  useEffect(() => {
    if (isCalculating && questionRefs.current.length === questions.length) {
      let max = 0;
      questionRefs.current.forEach(ref => {
        if (ref) {
          max = Math.max(max, ref.scrollHeight);
        }
      });
      setMaxHeight(max);
      setIsCalculating(false);
    }
  }, [isCalculating, questions.length]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToTop();
  }, [currentIndex]);

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
    setUnlockedExplanation(prev => ({...prev, [currentIndex]: true}));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setUserAnswer('');
    setScore(0);
    setAnswered({});
    setUnlockedExplanation({});
    setIsCalculating(true);
    setMaxHeight(0);
  };

  if (questions.length === 0) {
    return <div className="text-white">No fill-in-the-blanks quiz available.</div>;
  }

  if (isCalculating) {
    return (
      <div style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}>
        {questions.map((q, index) => (
          <div key={index} ref={el => questionRefs.current[index] = el} className="w-full max-w-2xl mx-auto flex flex-col items-center p-4">
            <div className="w-full flex-grow flex flex-col justify-center">
              <div className="w-full flex flex-col items-center">
                <div className="text-xl sm:text-2xl mb-4 text-center font-semibold text-white">
                  {q.question.split('_____').map((part, i, array) => (
                    <React.Fragment key={i}>
                      <ComplexTextDisplay text={part} />
                      {i < array.length - 1 && <span className="font-bold text-3xl sm:text-4xl text-stone-400 mx-2">_____</span>}
                    </React.Fragment>
                  ))}
                </div>
                <form className="w-full flex flex-col items-center">
                  <input type="text" className="w-full max-w-md p-3 bg-stone-700 border-2 rounded-lg text-center text-base sm:text-lg text-white" />
                  <button type="submit" className="mt-4 px-6 py-2 text-sm sm:text-base bg-stone-700 rounded-lg text-white font-bold">
                    Submit
                  </button>
                </form>
                <div className="mt-4 text-base sm:text-lg text-center">
                  <div className="text-red-400 font-bold">Incorrect. The correct answer is: <span className="font-extrabold"><ComplexTextDisplay text={q.answer} /></span></div>
                  <div className="mt-2 text-center text-stone-300">
                    <p className="text-sm sm:text-md font-semibold">Explanation:</p>
                    <div className="text-xs sm:text-sm mt-1"><ComplexTextDisplay text={q.description} /></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { question, answer, description } = questions[currentIndex];
  const answeredQuestion = answered[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center p-4 bg-stone-800 rounded-2xl shadow-2xl relative">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-bold text-stone-300">Score: <span className="text-white">{score} / {questions.length}</span></h2>
        <p className="text-sm sm:text-base font-semibold text-stone-400">Question {currentIndex + 1} of {questions.length}</p>
      </div>

      <div style={{ minHeight: maxHeight > 0 ? `${maxHeight}px` : undefined }} className="w-full flex-grow flex flex-col">
        <div className="w-full flex-grow flex flex-col justify-between gap-4">
          <div>
            <div className="text-lg sm:text-xl mb-4 text-center font-semibold text-white" dangerouslySetInnerHTML={{ __html: question.replace(/_____/g, '<span class="font-bold text-3xl sm:text-4xl text-stone-400 mx-2">_____</span>') }}>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={!!answeredQuestion}
              className={`w-full max-w-md p-3 bg-stone-700 border-2 rounded-lg text-center text-base sm:text-lg text-white transition-colors duration-300 shadow-inner ${
                answeredQuestion ? (answeredQuestion.isCorrect ? 'border-green-500' : 'border-red-500') : 'border-stone-600 focus:border-blue-500'
              }`}
            />
            <button
              type="submit"
              disabled={!!answeredQuestion}
              className="mt-4 px-6 py-2 text-sm sm:text-base bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold disabled:opacity-50"
            >
              Submit
            </button>
          </form>
          <div className="text-base sm:text-lg text-center relative p-4 bg-stone-900 rounded-lg" style={{ minHeight: '8rem' }}>
            <div
              className={`absolute inset-0 bg-stone-700 rounded-lg ${unlockedExplanation[currentIndex] ? 'opacity-0' : 'opacity-100'}`}
              style={{ zIndex: 1 }}
            ></div>
            <div style={{ zIndex: 0 }} className="relative">
              {answeredQuestion && (
                <div className="mb-2">
                  {answeredQuestion.isCorrect ? (
                    <p className="text-green-400 font-bold">Correct!</p>
                  ) : (
                    <div className="text-red-400 font-bold">Incorrect. The correct answer is: <span className="font-extrabold"><ComplexTextDisplay text={answer} /></span></div>
                  )}
                </div>
              )}
              <div className="text-stone-300">
                <p className="text-sm sm:text-md font-semibold">Explanation:</p>
                <div className="text-xs sm:text-sm mt-1"><ComplexTextDisplay text={description} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center w-full mt-6 pt-4 border-t border-stone-700">
        <button
          onClick={handlePrev}
          className="px-4 py-2 text-sm sm:text-base bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold"
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
          className="px-4 py-2 text-sm sm:text-base bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlanksQuiz;
