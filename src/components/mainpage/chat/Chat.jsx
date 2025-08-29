import { useRef, useState, useEffect } from 'react';
import InputBox from './InputBox';
import ChatInterface from './ChatInterface';
import { generateResponseStream } from "../../../utilities/gemini";

function Chat({ isDragging, setIsDragging }) {
  const chatContentRef = useRef(null);
  const chatboxContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [chatboxHeight, setChatboxHeight] = useState(0);
  const messagesEndRef = useRef(null);
  const lastMessageText = messages.length > 0 ? messages[messages.length - 1].text : '';

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

  // Chat height caclulation for user-ai container minimum height
  useEffect(() => {
    if (chatboxContainerRef.current) {
      setChatboxHeight(chatboxContainerRef.current.offsetHeight);
    }
  }, [messages.length]);

  // Handle user input and AI response in streams
  const handleUserMessage = async (userMessageText, files = []) => {
    const userMessage = { text: userMessageText, sender: "user", files: files, id: Date.now() + "-user" };
    const newMessages = [...messages, userMessage];
    const emptyAiMessage = { text: "", sender: "ai", id: Date.now() + "-ai" };

    setMessages((prevMessages) => [...prevMessages, userMessage, emptyAiMessage]);
    setAiLoading(true);

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
<div className="flex flex-col flex-grow overflow-x-hidden h-full pt-16">
      <div ref={chatContentRef} className="flex flex-col flex-grow overflow-y-auto p-4 z-10 items-center custom-scrollbar">
        <ChatInterface messages={messages} aiLoading={aiLoading} chatboxHeight={chatboxHeight} onEditMessage={handleEditMessage} />
        <div ref={messagesEndRef} />
      </div>
      <div ref={chatboxContainerRef} className="flex justify-center px-4 pb-2 md:pb-4 z-20">
        <InputBox onSendMessage={handleUserMessage} aiLoading={aiLoading} isDragging={isDragging} setIsDragging={setIsDragging} />
      </div>
    </div>
  );
}

export default Chat;
