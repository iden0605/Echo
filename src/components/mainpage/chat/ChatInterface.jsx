import MessageInstance from "./MessageInstance.jsx";
import LoadingDots from "./LoadingDots.jsx";

function ChatInterface({ messages, aiLoading, chatboxHeight, onEditMessage }) {
  const messagePairs = [];
  for (let i = 0; i < messages.length; i += 2) {
    const userMessage = messages[i];
    const aiMessage = messages[i + 1] || { sender: "ai", text: "" };
    messagePairs.push({ userMessage, aiMessage });
  }

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col space-y-4">
      {messagePairs.map((pair, index) => (
        <MessageInstance
          key={pair.aiMessage.id || `user-${index}`}
          userMessage={pair.userMessage}
          aiMessage={pair.aiMessage}
          aiLoading={aiLoading && index === messagePairs.length - 1 && pair.aiMessage.text === ""}
          chatboxHeight={chatboxHeight}
          onEditMessage={onEditMessage}
        />
      ))}
      {aiLoading && messages.length % 2 !== 0 && (
        <div className="self-start mt-2">
          <LoadingDots />
        </div>
      )}
    </div>
  );
}

export default ChatInterface;
