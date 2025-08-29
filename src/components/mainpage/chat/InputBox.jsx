import { useState, useEffect, useRef } from "react";
import { FiSend } from "react-icons/fi";
import { AiOutlinePlus } from "react-icons/ai";
import { FaMicrophone} from "react-icons/fa";
import { MdStop } from "react-icons/md";
import useSpeechToText from "../../../utilities/useSpeechToText";

function InputBox({ onSendMessage, aiLoading }) {
  const [currInput, setCurrInput] = useState("");
  const { isRecording, transcript, startRecording, stopRecording, setTranscript } = useSpeechToText();
  const textareaRef = useRef(null);

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
    if (currInput.trim() === "") return;
    setCurrInput("");
    setTranscript("");
    onSendMessage(currInput);
    
  };

  const handlePlusClick = () => {
    console.log("Plus button clicked");
  };

  const handleMicButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setCurrInput("");
      startRecording();
    }
  };

  const handleStopRecordingButton = () => {
    stopRecording();
  };

  const micSendButtonContent = (
    <>
      {aiLoading || isRecording ? (
        <button className="p-2" onClick={handleStopRecordingButton}>
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
    <div className="flex flex-row items-center w-full max-w-4xl mx-auto h-auto bg-stone-700 rounded-4xl p-2 z-10 md:flex-col md:p-4 md:min-h-20">
      
      {/* Mobile Plus Button */}
      <div className="flex items-center text-stone-400 hover:bg-stone-600 rounded-full md:hidden">
        <button className="p-2" onClick={handlePlusClick}>
          <AiOutlinePlus size={20} />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        placeholder="Ask Echo"
        className="w-full flex-grow bg-transparent select-none outline-none text-base leading-tight text-cream-50 pr-3 pl-4 pt-2 pb-2 overflow-y-auto resize-none custom-scrollbar"
        value={currInput}
        onChange={(e) => {
          if (isRecording) {
            stopRecording();
          }
          setCurrInput(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend();
          }
        }}
        rows={1}
        style={{ minHeight: '2.5rem' }}
      />

      {/* Desktop Buttons */}
      <div className="hidden md:flex justify-between items-center pt-2 w-full">
        <div className="flex items-center space-x-2 text-stone-400 hover:bg-stone-600 rounded-full ml-2">
          <button className="p-2" onClick={handlePlusClick}>
            <AiOutlinePlus size={20} />
          </button>
        </div>
        <div className={`flex items-center space-x-2 text-stone-400 rounded-full hover:bg-stone-600 ${aiLoading || currInput !== "" || isRecording ? "bg-stone-800" : ""}`}>
          {micSendButtonContent}
        </div>
      </div>

      {/* Mobile Mic/Send Button */}
      <div className={`md:hidden flex items-center text-stone-400 rounded-full hover:bg-stone-600 ${aiLoading || currInput !== "" || isRecording ? "bg-stone-800" : ""}`}>
        {micSendButtonContent}
      </div>

    </div>
  );
}

export default InputBox;
