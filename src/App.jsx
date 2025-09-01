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

  const handleNotesUpdate = (updatedText) => {
    setSplitScreenData(prevData => ({
      ...prevData,
      content: {
        ...prevData.content,
        text: updatedText
      }
    }));
  };

  const dragCounter = useRef(0);
  const rightSplitRef = useRef(null);
  const mobileRightSplitRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [minSizes, setMinSizes] = useState([600, 300]);

  const [splitSizes, setSplitSizes] = useState([50, 50]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      const screenWidth = window.innerWidth;
      const leftMin = (screenWidth * 300) / 1920;
      const rightMin = (screenWidth * 800) / 1920;
      setMinSizes([leftMin, rightMin]);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
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
      className="flex overflow-hidden"
      style={{ height: 'calc(var(--vh, 1vh) * 100)' }}
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
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-opacity-100 z-40"
                  onClick={() => setIsSplitVisible(false)}
                />
                <motion.div
                  ref={mobileRightSplitRef}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="fixed bottom-0 left-0 right-0 h-[85vh] bg-stone-900 shadow-2xl z-50 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RightSplit
                    data={splitScreenData}
                    setIsSplitVisible={setIsSplitVisible}
                    scrollContainerRef={mobileRightSplitRef}
                    onNotesUpdate={handleNotesUpdate}
                  />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      ) : (
        <Split
          className={`flex flex-grow ${!isSplitVisible ? 'split-collapsed' : ''} ${isGutterDragging ? 'gutter-dragging' : ''}`}
          sizes={isSplitVisible ? [34.375, 65.625] : [100, 0]}
          minSize={minSizes}
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
            ref={rightSplitRef}
            className={`split-panel relative bg-stone-900 ${!isSplitVisible ? 'hidden' : ''} overflow-y-auto custom-scrollbar`}
          >
            <RightSplit
              data={splitScreenData}
              setIsSplitVisible={setIsSplitVisible}
              scrollContainerRef={rightSplitRef}
              onNotesUpdate={handleNotesUpdate}
            />
          </div>
        </Split>
      )}
    </div>
  )
}

export default App;
