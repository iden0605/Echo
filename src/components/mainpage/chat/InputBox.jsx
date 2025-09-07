import { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { FaFileAlt } from "react-icons/fa";
import { FaMicrophone} from "react-icons/fa";
import { MdStop } from "react-icons/md";
import useSpeechToText from "../../../utilities/useSpeechToText";

function InputBox({ onSendMessage, aiLoading, isDragging, setIsDragging, onStop }) {
  const [currInput, setCurrInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileError, setFileError] = useState(""); // New state for file errors
  const { isRecording, transcript, startRecording, stopRecording, setTranscript } = useSpeechToText();
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const filePreviewRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [thumbLeft, setThumbLeft] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  useEffect(() => {
    const filePreviewElement = filePreviewRef.current;

    const updateScrollbar = () => {
      if (!filePreviewElement) return;
      const { scrollWidth, clientWidth, scrollLeft } = filePreviewElement;
      
      const trackWidth = clientWidth - 32;
      const contentVisibleWidth = clientWidth - 32;
      
      const scrollableWidth = scrollWidth - contentVisibleWidth;

      if (scrollableWidth <= 0) {
        setThumbWidth(0);
        return;
      }

      const newThumbWidth = Math.max((contentVisibleWidth / scrollWidth) * trackWidth, 20);
      const thumbMovableWidth = trackWidth - newThumbWidth;
      const newThumbLeft = (scrollLeft / scrollableWidth) * thumbMovableWidth;

      setThumbWidth(newThumbWidth);
      setThumbLeft(newThumbLeft);
    };

    const handleScroll = () => {
      updateScrollbar();
      setIsScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 800);
    };

    if (filePreviewElement) {
      updateScrollbar(); // Initial calculation
      filePreviewElement.addEventListener('scroll', handleScroll);
    }

    window.addEventListener('resize', updateScrollbar);

    const resizeObserver = new ResizeObserver(updateScrollbar);
    if (filePreviewElement) {
      resizeObserver.observe(filePreviewElement);
    }

    return () => {
      if (filePreviewElement) {
        filePreviewElement.removeEventListener('scroll', handleScroll);
        resizeObserver.unobserve(filePreviewElement);
      }
      window.removeEventListener('resize', updateScrollbar);
      clearTimeout(scrollTimeoutRef.current);
    };
  }, [selectedFiles]);

  useEffect(() => {
    if (isRecording) {
      setCurrInput(transcript);
    }
  }, [transcript, isRecording]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 320) + 'px';
    }
  }, [currInput]);

  const handleSend = async () => {
    if (aiLoading || (currInput.trim() === "" && selectedFiles.length === 0)) return;
    onSendMessage(currInput, selectedFiles);
    setCurrInput("");
    setSelectedFiles([]);
    setTranscript("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setFileError("");

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = [];
    let hasError = false;

    for (const file of droppedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File "${file.name}" exceeds the 10MB limit.`);
        hasError = true;
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
    e.dataTransfer.clearData();
  };

  const handlePlusClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    setFileError("");
    const newFiles = Array.from(event.target.files);
    const validFiles = [];
    let hasError = false;

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setFileError(`File "${file.name}" exceeds the 10MB limit.`);
        hasError = true;
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
    }
    event.target.value = null;
  };

  const handleRemoveFile = (fileToRemove) => {
    setSelectedFiles(selectedFiles.filter(file => file !== fileToRemove));
  };

  const handleMicButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setCurrInput("");
      startRecording();
    }
  };

  const handleStop = () => {
    if (aiLoading) {
      onStop();
    } else {
      stopRecording();
    }
  };

  const micSendButtonContent = (
    <>
      {aiLoading || isRecording ? (
        <button className="p-2" onClick={handleStop}>
          <MdStop size={20} />
        </button>
      ) : currInput === "" ? (
        <button className="p-2" onClick={handleMicButtonClick}>
          <FaMicrophone size={20} />
        </button>
      ) : (
        <button className="p-2" onClick={handleSend}>
          <FiSend className="rotate-45 -translate-x-0.5" size={20} />
        </button>
      )}
    </>
  );

  return (
    <div 
      className="relative flex flex-col w-full max-w-4xl mx-auto"
      onDrop={handleDrop}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-stone-900 bg-opacity-70 flex items-center justify-center rounded-4xl border-2 border-dashed border-stone-400 z-20 pointer-events-none">
          <p className="text-stone-300 text-lg font-semibold">drag and drop files here</p>
        </div>
      )}
      {fileError && (
        <div className="bg-red-500 text-white text-sm p-2 rounded-t-lg text-center">
          {fileError}
        </div>
      )}
      {selectedFiles.length > 0 && (
        <div className="relative bg-stone-700 rounded-t-4xl overflow-hidden">
          <div
            ref={filePreviewRef}
            className="p-4 overflow-x-auto file-preview-scrollbar scroll-pe-4"
          >
            <div className="flex space-x-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex-shrink-0 bg-stone-800 rounded-lg w-40 h-24 relative overflow-hidden group border border-stone-500">
                  <button
                    onClick={() => handleRemoveFile(file)}
                    className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 hover:bg-black/75 z-10 invisible group-hover:visible transition-opacity duration-300"
                  >
                    <AiOutlineClose size={12} className="text-white"/>
                  </button>
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt={file.name} className="w-full h-full object-cover"/>
                  ) : (
                    <div className="p-3 flex flex-col justify-center h-full bg-stone-600">
                      <div className="flex items-center space-x-2">
                        <FaFileAlt className="text-stone-400 flex-shrink-0" size={20} />
                        <p className="text-cream-50 text-sm font-medium truncate">{file.name}</p>
                      </div>
                      <p className="text-stone-400 text-xs mt-1">{Math.round(file.size / 1024)} KB</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-1 left-0 w-full h-1.5 px-4">
            <div
              className="h-full bg-stone-500 rounded-full transition-opacity duration-500"
              style={{
                width: `${thumbWidth}px`,
                transform: `translateX(${thumbLeft}px)`,
                opacity: isScrolling ? 1 : 0,
              }}
            />
          </div>
        </div>
      )}
      <div className={`flex flex-row items-end w-full h-auto bg-stone-700 p-2 z-10 md:flex-col md:p-4 md:min-h-20 ${selectedFiles.length > 0 || fileError ? 'rounded-b-4xl' : 'rounded-4xl'}`}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
          multiple
          accept=".txt,.md,.rtf,.pdf,.docx,.odt,.csv,.xlsx,.ods,.pptx,.odp,.png,.jpg,.jpeg,.gif,.svg,.py,.js,.java,.c,.cpp,.html,.css,.ts"
        />
      <div className="flex items-center text-stone-400 hover:bg-stone-600 rounded-full md:hidden">
        <button className="p-2" onClick={handlePlusClick} disabled={aiLoading}>
          <AiOutlinePlus size={20} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        placeholder={aiLoading ? "Echo is thinking..." : "Ask Echo"}
        className="w-full flex-grow bg-transparent outline-none text-base leading-normal text-cream-50 pr-3 pl-4 py-2 overflow-y-auto resize-none custom-scrollbar"
        value={currInput}
        onChange={(e) => {
          if (isRecording) {
            stopRecording();
          }
          setCurrInput(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && !aiLoading) {
            e.preventDefault()
            handleSend();
          }
        }}
        rows={1}
        style={{ minHeight: '2.5rem' }}
      />

      <div className="hidden md:flex justify-between items-center pt-2 w-full">
        <div className="flex items-center space-x-2 text-stone-400 hover:bg-stone-600 rounded-full ml-2">
          <button className="p-2" onClick={handlePlusClick} disabled={aiLoading}>
            <AiOutlinePlus size={20} />
          </button>
        </div>
        <div className={`flex items-center space-x-2 text-stone-400 rounded-full hover:bg-stone-600 ${aiLoading || currInput !== "" || isRecording ? "bg-stone-800" : ""}`}>
          {micSendButtonContent}
        </div>
      </div>

      <div className={`md:hidden flex items-center text-stone-400 rounded-full hover:bg-stone-600 ${aiLoading || currInput !== "" || isRecording ? "bg-stone-800" : ""}`}>
        {micSendButtonContent}
      </div>
    </div>
    </div>
  );
}

export default InputBox;
