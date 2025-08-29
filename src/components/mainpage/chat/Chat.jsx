import { useRef, useState, useEffect } from 'react';
import InputBox from './InputBox';
import ChatInterface from './ChatInterface';
import { generateResponseStream } from "../../../utilities/gemini";

function Chat({ isDragging, setIsDragging, isSplitVisible, setIsSplitVisible }) {
  const chatContentRef = useRef(null);
  const chatboxContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatboxHeight, setChatboxHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const lastMessageText = messages.length > 0 ? messages[messages.length - 1].text : '';

  // State for custom scrollbar
  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to Bottom
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timer);
  }, [messages.length]);

  // Chat height calculation
  useEffect(() => {
    if (chatboxContainerRef.current) {
      setChatboxHeight(chatboxContainerRef.current.offsetHeight);
    }
  }, [messages.length]);

  // Custom Scrollbar Logic
  useEffect(() => {
    const chatContentElement = chatContentRef.current;

    const updateScrollbar = () => {
      if (!chatContentElement) return;
      const { scrollHeight, clientHeight, scrollTop } = chatContentElement;
      
      const trackHeight = clientHeight;
      const scrollableHeight = scrollHeight - clientHeight;

      if (scrollableHeight <= 0) {
        setThumbHeight(0);
        return;
      }

      const newThumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 20); // Min height 20px
      const thumbMovableHeight = trackHeight - newThumbHeight;
      const newThumbTop = (scrollTop / scrollableHeight) * thumbMovableHeight;

      setThumbHeight(newThumbHeight);
      setThumbTop(newThumbTop);
    };

    const handleScroll = () => {
      updateScrollbar();
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 500);
    };

    if (chatContentElement) {
      updateScrollbar();
      chatContentElement.addEventListener('scroll', handleScroll);
    }

    window.addEventListener('resize', updateScrollbar);

    const resizeObserver = new ResizeObserver(updateScrollbar);
    if (chatContentElement) {
      resizeObserver.observe(chatContentElement);
    }

    return () => {
      if (chatContentElement) {
        chatContentElement.removeEventListener('scroll', handleScroll);
        resizeObserver.unobserve(chatContentElement);
      }
      window.removeEventListener('resize', updateScrollbar);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [messages]);

  // Handle user input and AI response in streams
  const handleUserMessage = async (userMessageText, files = []) => {
    const userMessage = { text: userMessageText, sender: "user", files: files, id: Date.now() + "-user" };
    const newMessages = [...messages, userMessage];
    const emptyAiMessage = { text: "", sender: "ai", id: Date.now() + "-ai" };

    setMessages((prevMessages) => [...prevMessages, userMessage, emptyAiMessage]);
    setAiLoading(true);
    setIsSplitVisible(true);

    let streamedResponse = "";
    await generateResponseStream(newMessages, userMessageText, files, (chunk) => {
      streamedResponse += chunk;
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === emptyAiMessage.id);
        if (aiMessageIndex !== -1) {
          updatedMessages[aiMessageIndex] = { ...updatedMessages[aiMessageIndex], text: streamedResponse };
        }
        return updatedMessages;
      });
    });

    setAiLoading(false);
  };

  const handleEditMessage = async (userMessageId, newText) => {
    let messageHistoryForEdit = [];
    let userMessageIndex = -1;
    let files = [];
  
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map((msg, index) => {
        if (msg.id === userMessageId) {
          userMessageIndex = index;
          files = msg.files || [];
          return { ...msg, text: newText, edited: true };
        }
        return msg;
      });
  
      if (userMessageIndex !== -1) {
        messageHistoryForEdit = updatedMessages.slice(0, userMessageIndex + 1);
        return messageHistoryForEdit;
      }
  
      return prevMessages;
    });
  
    if (userMessageIndex !== -1) {
      const emptyAiMessage = { text: "", sender: "ai", id: Date.now() + "-ai" };
      setMessages(prev => [...prev, emptyAiMessage]);
      setAiLoading(true);
  
      let streamedResponse = "";
      await generateResponseStream(messageHistoryForEdit, newText, files, (chunk) => {
        streamedResponse += chunk;
        setMessages(prevMessages => {
          const updatedMessages = [...prevMessages];
          const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === emptyAiMessage.id);
          if (aiMessageIndex !== -1) {
            updatedMessages[aiMessageIndex] = { ...updatedMessages[aiMessageIndex], text: streamedResponse };
          }
          return updatedMessages;
        });
      });
  
      setAiLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col flex-grow overflow-hidden h-full pt-16">
      <style>{`
        .chat-content::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        ref={chatContentRef}
        className="chat-content flex flex-col flex-grow overflow-y-auto p-4 z-10 items-center"
      >
        <ChatInterface messages={messages} aiLoading={aiLoading} chatboxHeight={chatboxHeight} onEditMessage={handleEditMessage} isSplitVisible={isSplitVisible} setIsSplitVisible={setIsSplitVisible} />
        <div ref={messagesEndRef} />
      </div>
      
      {/* Custom Scrollbar */}
      {thumbHeight > 0 && (
        <div 
          className="absolute top-16 right-0 w-2 py-1 pointer-events-none"
          style={{
              height: `calc(100% - 4rem - ${chatboxHeight}px)`
          }}
        >
          <div 
            className="w-1 bg-stone-500 rounded-full transition-opacity duration-500 hover:bg-stone-400"
            style={{ 
              height: `${thumbHeight}px`, 
              transform: `translateY(${thumbTop}px)`,
              opacity: isScrolling ? 1 : 0,
            }}
          />
        </div>
      )}

      <div ref={chatboxContainerRef} className="flex justify-center px-4 pb-2 md:pb-4 z-20">
        <InputBox onSendMessage={handleUserMessage} aiLoading={aiLoading} isDragging={isDragging} setIsDragging={setIsDragging} />
      </div>
    </div>
  );
}

export default Chat;
