import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiEdit, FiSend, FiX, FiColumns } from 'react-icons/fi';
import { FaFileAlt } from 'react-icons/fa';
import LoadingDots from './LoadingDots';
import StreamedResponse from './StreamedResponse';

function MessageInstance({ userMessage, aiMessage, aiLoading, chatboxHeight, onEditMessage, isSplitVisible, setIsSplitVisible }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const userTextRef = useRef(null);
  const [showReadMore, setShowReadMore] = useState(false);
  const [minHeight, setMinHeight] = useState('75vh');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(userMessage?.text || '');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (userTextRef.current) {
      const lineHeight = parseFloat(getComputedStyle(userTextRef.current).lineHeight);
      const maxHeight = lineHeight * 5;
      if (userTextRef.current.scrollHeight > maxHeight) {
        setShowReadMore(true);
      } else {
        setShowReadMore(false);
      }
    }
  }, [userMessage?.text]);

  useEffect(() => {
    if (chatboxHeight > 0) {
      const header = document.getElementById('main-header');
      const headerHeight = header ? header.offsetHeight : 0;
      const calculatedHeight = `calc(var(--vh, 1vh) * 100 - ${chatboxHeight}px - ${headerHeight}px - 32px)`;
      setMinHeight(calculatedHeight);
    }
  }, [chatboxHeight]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedText(userMessage?.text);
  };

  const handleSaveEdit = () => {
    onEditMessage(userMessage.id, editedText);
    setIsEditing(false);
  };

  const buttonVariants = {
    hidden: { opacity: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    visible: { opacity: 1, transition: { duration: 0.1, ease: 'easeOut' } },
  };

  return (
    <div className="flex flex-col space-y-4" style={{ minHeight: minHeight }}>
      {userMessage && userMessage.text && (
        <div
          className="self-end flex flex-col items-end w-full"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="w-full pl-8 flex justify-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`relative px-4 py-3 rounded-3xl bg-stone-700 text-cream-50 text-left ${showReadMore ? 'pr-8 pt-6' : ''} ${isEditing ? 'ring-1 ring-stone-500 max-w-[95%] w-full' : 'max-w-[95%] md:max-w-[70%]'}`}
            >
              <motion.button
                onClick={handleEdit}
                className="absolute top-0 translate-y-2 left-0 -translate-x-full p-2 text-stone-400 hover:text-stone-200"
                variants={buttonVariants}
                initial="hidden"
                animate={isHovered && !aiLoading && !isEditing ? 'visible' : 'hidden'}
              >
                <FiEdit size={17} />
              </motion.button>
              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="bg-transparent text-cream-50 w-full focus:outline-none resize-none"
                  style={{ height: 'auto', minHeight: '8rem', maxHeight: '20rem' }}
                />
              ) : (
                <>
                  {userMessage.files && userMessage.files.length > 0 && (
                    <div className="mb-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {userMessage.files.map((file, index) => (
                        <div key={index} className="bg-stone-600 p-2 rounded-lg">
                          {file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-24 object-cover rounded-md"/>
                          ) : (
                            <div className="flex flex-col items-center justify-center h-24">
                              <FaFileAlt className="text-stone-400" size={32} />
                              <p className="text-cream-50 text-xs text-center mt-2 truncate w-full">{file.name}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    ref={userTextRef}
                    className={`${!isExpanded && showReadMore ? 'line-clamp-5' : ''} whitespace-pre-wrap break-words`}
                  >
                    {userMessage.text}
                  </motion.div>
                  {showReadMore && (
                    <button
                      onClick={toggleExpand}
                      className="absolute top-2 right-2 text-stone-400 hover:text-stone-200"
                    >
                      {isExpanded ? <FiChevronUp size={24} /> : <FiChevronDown size={24} />}
                    </button>
                  )}
                  {userMessage.edited && (
                    <div className="text-xs text-stone-500 text-right mt-1">
                      Edited
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
          {isEditing && (
            <div className="flex justify-end space-x-2 mt-2 max-w-[70%] w-full">
              <button onClick={handleCancelEdit} className="p-2 text-stone-400 rounded-full hover:bg-stone-600 bg-stone-700">
                <FiX size={20} />
              </button>
              <button
                onClick={handleSaveEdit}
                className={`p-2 rounded-full text-stone-400 ${editedText !== userMessage.text ? "hover:bg-stone-600 bg-stone-700" : "bg-stone-800"}`}
                disabled={editedText === userMessage.text}
              >
                <FiSend className="rotate-45 -translate-x-0.5" size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {aiMessage && (aiMessage.text || aiLoading) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex items-start space-x-2"
        >
          <div className="relative px-4 py-3 rounded-3xl bg-black/20 text-cream-50 self-start text-left backdrop-blur-lg break-words">
            {aiLoading ? (
              <LoadingDots />
            ) : (
              <StreamedResponse text={aiMessage.text} />
            )}
          </div>
          {!aiLoading && aiMessage.type && (
            <button
              onClick={() => setIsSplitVisible(!isSplitVisible)}
              className="p-2 text-stone-400 hover:text-stone-200"
            >
              <FiColumns size={17} />
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default MessageInstance;
