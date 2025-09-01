import { useRef, useState, useEffect } from 'react';
import InputBox from './InputBox';
import ChatInterface from './ChatInterface';
import { generateText } from "../../../utilities/api";

function Chat({ isDragging, setIsDragging, isSplitVisible, setIsSplitVisible, setSplitScreenData }) {
  const chatContentRef = useRef(null);
  const chatboxContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatboxHeight, setChatboxHeight] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const initialHeight = useRef(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      if (currentHeight < initialHeight.current * 0.85) {
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initialMessages = [
      { text: null, sender: "user", id: Date.now() + "-initial-user" },
      {
        text: "Hi, I'm Echo, your personal academic AI assistant. I can help you generate quizzes, flashcards, and notes. How can I help you today?",
        sender: "ai",
        id: Date.now() + "-initial-ai"
      }
    ];
    setMessages(initialMessages);
  }, []);

  const [thumbHeight, setThumbHeight] = useState(0);
  const [thumbTop, setThumbTop] = useState(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 0);
    return () => clearTimeout(timer);
  }, [messages.length]);

  useEffect(() => {
    if (chatboxContainerRef.current) {
      setChatboxHeight(chatboxContainerRef.current.offsetHeight);
    }
  }, [messages.length]);

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

  const handleUserMessage = async (userMessageText, files = []) => {
    if (!userMessageText.trim() && files.length === 0) {
      return;
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const userMessage = { text: userMessageText, sender: "user", files: files, id: Date.now() + "-user" };
    const newMessages = [...messages, userMessage];
    const emptyAiMessage = { text: "", sender: "ai", id: Date.now() + "-ai" };

    setMessages((prevMessages) => [...prevMessages, userMessage, emptyAiMessage]);
    setAiLoading(true);

    try {
      const history = newMessages.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
      const result = await generateText(userMessageText, history, files, signal);

      const { response, type, content, desc } = result;

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === emptyAiMessage.id);
        if (aiMessageIndex !== -1) {
          updatedMessages[aiMessageIndex] = { ...updatedMessages[aiMessageIndex], text: response, type: type };
        }
        return updatedMessages;
      });

      if (type) {
        setSplitScreenData({ type, content, desc });
        setIsSplitVisible(true);
      } else {
        setSplitScreenData({ type: null, content: null, desc: null });
        setIsSplitVisible(false);
      }
    } catch (error) {
      if (error.name !== 'GoogleGenerativeAIAbortError') {
        console.error("Error generating text:", error);
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === emptyAiMessage.id);
          if (aiMessageIndex !== -1) {
            updatedMessages[aiMessageIndex] = { ...updatedMessages[aiMessageIndex], text: "Sorry, I'm having trouble connecting. Please check your internet connection and try again.", type: "error" };
          }
          return updatedMessages;
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setAiLoading(false);
    setMessages(prevMessages => {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && lastMessage.sender === 'ai' && lastMessage.text === '') {
            return prevMessages;
        }
        return [...prevMessages, { text: "", sender: "ai", id: Date.now() + "-ai", type: "none" }];
    });
};

  const handleEditMessage = async (userMessageId, newText) => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let messageHistoryForEdit = [];
    let userMessageIndex = -1;
  
    setMessages(prevMessages => {
      const updatedMessages = prevMessages.map((msg, index) => {
        if (msg.id === userMessageId) {
          userMessageIndex = index;
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
  
      try {
        const history = messageHistoryForEdit.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
        const result = await generateText(newText, history, [], signal);

        const { response, type, content, desc } = result;

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === emptyAiMessage.id);
          if (aiMessageIndex !== -1) {
            updatedMessages[aiMessageIndex] = { ...updatedMessages[aiMessageIndex], text: response, type: type };
          }
          return updatedMessages;
        });

        if (type) {
          setSplitScreenData({ type, content, desc });
          setIsSplitVisible(true);
        } else {
          setSplitScreenData({ type: null, content: null, desc: null });
          setIsSplitVisible(false);
        }
      } catch (error) {
        if (error.name !== 'GoogleGenerativeAIAbortError') {
          console.error("Error generating text:", error);
          setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages];
            const aiMessageIndex = updatedMessages.findIndex(msg => msg.id === emptyAiMessage.id);
            if (aiMessageIndex !== -1) {
              updatedMessages[aiMessageIndex] = { ...updatedMessages[aiMessageIndex], text: "Sorry, I'm having trouble connecting. Please check your internet connection and try again.", type: "error" };
            }
            return updatedMessages;
          });
        }
      } finally {
        setAiLoading(false);
      }
    }
  };

  return (
    <div className={`relative flex flex-col flex-grow overflow-hidden h-full ${isKeyboardVisible ? 'keyboard-visible' : ''}`}>
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
        <InputBox onSendMessage={handleUserMessage} aiLoading={aiLoading} isDragging={isDragging} setIsDragging={setIsDragging} onStop={handleStop} />
      </div>
    </div>
  );
}

export default Chat;
