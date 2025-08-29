import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Split from 'react-split';
import { FiX } from 'react-icons/fi';
import Chat from './components/mainpage/chat/Chat';
import Header from './components/mainpage/Header';
import RightSplit from './components/mainpage/right_split/RightSplit';
import './components/mainpage/chat/split.css';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [isGutterDragging, setIsGutterDragging] = useState(false);
  const [isSplitVisible, setIsSplitVisible] = useState(false);
  const [splitScreenData, setSplitScreenData] = useState({ type: null, content: null });
  const dragCounter = useRef(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isMobile ? (
        <>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <Header />
            <Chat isDragging={isDragging} setIsDragging={setIsDragging} isSplitVisible={isSplitVisible} setIsSplitVisible={setIsSplitVisible} setSplitScreenData={setSplitScreenData} />
          </div>
          <AnimatePresence>
            {isSplitVisible && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed bottom-0 left-0 right-0 h-[90vh] bg-stone-900 p-4 shadow-lg z-50 overflow-y-auto"
              >
                <button
                  onClick={() => setIsSplitVisible(false)}
                  className="absolute top-2 right-2 p-2 text-stone-400 hover:text-stone-200 z-30"
                >
                  <FiX size={24} />
                </button>
                <RightSplit data={splitScreenData} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <Split
          className={`flex flex-grow ${!isSplitVisible ? 'split-collapsed' : ''} ${isGutterDragging ? 'gutter-dragging' : ''}`}
          sizes={isSplitVisible ? [50, 50] : [100, 0]}
          minSize={[400, 500]}
          expandToMin={false}
          gutterSize={isSplitVisible ? 21 : 0}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          onDragStart={() => setIsGutterDragging(true)}
          onDragEnd={() => setIsGutterDragging(false)}
        >
          <div className="flex-1 flex flex-col overflow-y-auto">
            <Header />
            <Chat isDragging={isDragging} setIsDragging={setIsDragging} isSplitVisible={isSplitVisible} setIsSplitVisible={setIsSplitVisible} setSplitScreenData={setSplitScreenData} />
          </div>
          <div
            className={`split-panel relative bg-stone-900 ${!isSplitVisible ? 'hidden' : ''}`}
            style={{ overflow: 'hidden' }}
          >
            <button
              onClick={() => setIsSplitVisible(!isSplitVisible)}
              className="absolute top-2 right-2 p-2 text-stone-400 hover:text-stone-200 z-30"
            >
              <FiX size={24} />
            </button>
            <div className="h-full overflow-y-auto">
              <RightSplit data={splitScreenData} />
            </div>
          </div>
        </Split>
      )}
    </div>
  )
}

export default App;
