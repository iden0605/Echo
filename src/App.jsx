import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import Chat from './components/mainpage/chat/Chat';
import Header from './components/mainpage/Header';
import RightSplit from './components/mainpage/right_split/RightSplit';
import './components/mainpage/chat/split.css';

function App() {
  const [isDragging, setIsDragging] = useState(false);
  const [isSplitVisible, setIsSplitVisible] = useState(false);
  const [splitScreenData, setSplitScreenData] = useState({ type: null, content: null });
  const dragCounter = useRef(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const containerRef = useRef(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const [initialWidths, setInitialWidths] = useState({ left: '50%', right: '50%' });

  const x = useMotionValue(0);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const minLeftWidth = 1200;
        const minRightWidth = 200;

        let targetLeftWidth = minLeftWidth;
        if (targetLeftWidth > containerWidth - minRightWidth) {
          targetLeftWidth = containerWidth - minRightWidth;
        }
        const targetRightWidth = containerWidth - targetLeftWidth;

        setInitialWidths({
          left: targetLeftWidth,
          right: targetRightWidth,
        });

        x.set(targetLeftWidth);

        setDragConstraints({
          left: minLeftWidth,
          right: containerWidth - minRightWidth,
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [x]);

  const leftWidth = useTransform(x, val => `${val}px`);
  const rightWidth = useTransform(x, val => `calc(100% - ${val}px)`);

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
      ref={containerRef}
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
        <div className="flex flex-grow" ref={containerRef}>
          <motion.div
            className="flex-1 flex flex-col overflow-y-auto"
            style={{ width: isSplitVisible ? leftWidth : '100%' }}
          >
            <Header />
            <Chat isDragging={isDragging} setIsDragging={setIsDragging} isSplitVisible={isSplitVisible} setIsSplitVisible={setIsSplitVisible} setSplitScreenData={setSplitScreenData} />
          </motion.div>
          <AnimatePresence>
            {isSplitVisible && (
              <>
                <motion.div
                  className="gutter gutter-horizontal"
                  drag="x"
                  dragConstraints={dragConstraints}
                  dragMomentum={false}
                  dragElastic={0}
                  style={{ x }}
                  onMouseDown={() => document.body.classList.add('gutter-dragging')}
                  onMouseUp={() => document.body.classList.remove('gutter-dragging')}
                  onDragStart={() => document.body.classList.add('gutter-dragging')}
                  onDragEnd={() => document.body.classList.remove('gutter-dragging')}
                />
                <motion.div
                  className="relative bg-stone-900"
                  style={{ width: rightWidth, overflow: 'hidden' }}
                >
                  <button
                    onClick={() => setIsSplitVisible(false)}
                    className="absolute top-2 right-2 p-2 text-stone-400 hover:text-stone-200 z-30"
                  >
                    <FiX size={24} />
                  </button>
                  <div className="h-full overflow-y-auto">
                    <RightSplit data={splitScreenData} />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default App;
