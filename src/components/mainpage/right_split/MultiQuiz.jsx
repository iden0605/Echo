import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';

const MultiQuiz = ({ content, desc, scrollContainerRef }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState({});
  const [unlockedExplanation, setUnlockedExplanation] = useState({});
  const [maxHeight, setMaxHeight] = useState(0);
  const [isCalculating, setIsCalculating] = useState(true);
  const questionRefs = useRef([]);

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
    setUnlockedExplanation(prev => ({...prev, [currentIndex]: true}));
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setAnswered({});
    setUnlockedExplanation({});
    setIsCalculating(true);
    setMaxHeight(0);
  };

  if (questions.length === 0) {
    return <div className="text-white">No quiz available.</div>;
  }

  if (isCalculating) {
    return (
      <div style={{ visibility: 'hidden', position: 'absolute', zIndex: -1 }}>
        {questions.map((q, index) => (
          <div key={index} ref={el => questionRefs.current[index] = el} className="w-full max-w-3xl mx-auto flex flex-col items-center p-4">
            <div className="w-full flex-grow flex flex-col justify-center">
              <div className="w-full">
                <div className="text-xl sm:text-2xl font-bold mb-4 text-center text-white flex items-center justify-center">
                  <ComplexTextDisplay text={q.question} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                  {q.options.map((option, i) => (
                    <button key={i} className="p-3 rounded-lg text-left text-white text-sm sm:text-base shadow-md bg-stone-700">
                      <ComplexTextDisplay text={option} />
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-center text-stone-300">
                    <p className="text-lg font-semibold">Explanation:</p>
                    <div className="text-base mt-1"><ComplexTextDisplay text={q.description} /></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const { question, options, correctAnswer, description } = questions[currentIndex];
  const answeredQuestion = answered[currentIndex];

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center p-4 bg-stone-800 rounded-2xl shadow-2xl relative">
      <div className="w-full flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-lg font-bold text-stone-300">Score: <span className="text-white">{score} / {questions.length}</span></h2>
        <p className="text-sm sm:text-base font-semibold text-stone-400">Question {currentIndex + 1} of {questions.length}</p>
      </div>

      <div style={{ minHeight: maxHeight > 0 ? `${maxHeight}px` : undefined }} className="w-full flex-grow flex flex-col">
        <div className="w-full flex-grow flex flex-col justify-between gap-4">
          <div>
            <div className="text-lg sm:text-xl font-bold mb-4 text-center text-white">
              <ComplexTextDisplay text={question} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
            {options.map((option, index) => {
              const isCorrect = option === correctAnswer;
              const isSelected = answeredQuestion && answeredQuestion.answer === option;
              let buttonClass = "p-3 rounded-lg transition-all duration-300 text-left text-white text-sm sm:text-base shadow-md ";
              
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
          <div className="text-center text-stone-300 relative p-4 bg-stone-900 rounded-lg" style={{ minHeight: '6rem' }}>
            <div
              className={`absolute inset-0 bg-stone-700 rounded-lg ${unlockedExplanation[currentIndex] ? 'opacity-0' : 'opacity-100'}`}
              style={{ zIndex: 1 }}
            ></div>
            <div style={{ zIndex: 0 }} className="relative">
              <p className="text-lg font-semibold">Explanation:</p>
              <div className="text-base mt-1"><ComplexTextDisplay text={description} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center w-full mt-6 pt-4 border-t border-stone-700 gap-4">
        <button
          onClick={handlePrev}
          className="px-3 sm:px-6 py-2 sm:py-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold text-xs sm:text-sm justify-self-start"
        >
          Prev
        </button>
        <button
          onClick={handleRestart}
          className="p-3 bg-stone-700 hover:bg-stone-600 rounded-full transition-colors text-white justify-self-center"
          aria-label="Restart Quiz"
        >
          <FiRefreshCw size={20} />
        </button>
        <button
          onClick={handleNext}
          className="px-3 sm:px-6 py-2 sm:py-3 bg-stone-700 hover:bg-stone-600 rounded-lg transition-colors text-white font-bold text-xs sm:text-sm justify-self-end"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default MultiQuiz;
