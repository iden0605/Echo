# Project Explanation: Echo Chat Application

This document outlines three core features of the Echo chat application: how messages are paired and structured, how they are rendered in the chat interface, and the logic behind the dynamic right split-screen view.

## 1. Message Pairing and Structuring

The application organizes the conversation flow by pairing user messages with their corresponding AI responses. This logic resides in the `ChatInterface.jsx` component.

Additionally, to ensure the chat interface feels expansive and doesn't feel cramped on larger screens, the `MessageInstance.jsx` component dynamically calculates a minimum height. This calculation is based on the height of the input box at the bottom and the header at the top, effectively making the chat log fill the available vertical space.

```jsx

// In ChatInterface.jsx - Pairing logic
const messagePairs = [];
for (let i = 0; i < messages.length; i += 2) {
  const userMessage = messages[i];
  const aiMessage = messages[i + 1] || { sender: "ai", text: "" };
  messagePairs.push({ userMessage, aiMessage });
}

// In MessageInstance.jsx - Min-height calculation
useEffect(() => {
  if (chatboxHeight > 0) {
    const header = document.getElementById('main-header');
    const headerHeight = header ? header.offsetHeight : 0;
    const calculatedHeight = `calc(var(--vh, 1vh) * 100 - ${chatboxHeight}px - ${headerHeight}px - 32px)`;
    setMinHeight(calculatedHeight);
  }
}, [chatboxHeight]);


```

## 2. Chat Rendering

Once the messages are paired, `ChatInterface.jsx` renders the conversation. It maps over the `messagePairs` array and passes each pair to a `MessageInstance` component.

This modular approach keeps the code clean: `ChatInterface` handles the overall structure and looping, while `MessageInstance` is responsible for the detailed presentation of a single user-AI exchange, including any animations and user interaction options like editing.

```jsx


// In ChatInterface.jsx
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
        isSplitVisible={isSplitVisible}
        setIsSplitVisible={setIsSplitVisible}
      />
    ))}
    {/* ... loading indicator ... */}
  </div>
);


```

## 3. Right Split Screen Logic

The logic for the right split-screen is a multi-step process that begins on the backend within `api.js`, involving two distinct AI models to first classify the user's intent and then generate the appropriate content.

1.  **Intent Classification (AI Model 1):** When a user sends a message, the first AI model's job is to classify the request. It determines if the user is simply asking for a text response (`respondonly`) or if they are requesting a specific learning tool (`flashcard`, `multi_quiz`, `blanks_quiz`, or `notes`).

2.  **Content Generation (AI Model 2):** If a specific tool is requested, a second AI model is invoked. This model is equipped with function declarations that define the exact data structure for each quiz type. The second AI's task is to generate the content (questions, answers, descriptions) and format it according to the required structure for the function that was triggered by the first AI.

3.  **Frontend Rendering:** The final data object, which includes a "type" and "content", is sent to the frontend. The "RightSplit.jsx" component receives this data and uses a switch statement on the type property to render the correct React component passing the generated content to it as props.

```javascript

// In api.js
async function generateText(prompt, history) {
    // Step 1: AI Model 1 classifies the prompt
    const model1 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response1 = await model1.generateContent(/* ... */);
    const classification = response1.response.text(); // e.g., "multi_quiz"

    if (classification.includes('respondonly')) {
        // Generate a simple text response
    } else {
        // Step 2: AI Model 2 generates content using function calling
        const model3 = genAI2.getGenerativeModel({ model: "gemini-2.5-flash", tools: [tools] });
        const response3 = await model3.generateContent(/* ... */);
        const functionCalls = response3.response.functionCalls();

        if (functionCalls && functionCalls.length > 0) {
            const functionCall = functionCalls[0];
            let finalData;

            // Call the appropriate function based on the AI's choice
            if (functionCall.name === 'create_flashcards') {
                finalData = createFlashcards(functionCall.args.response, functionCall.args.content);
            } else if (functionCall.name === 'create_multiple_choice_quiz') {
                finalData = createMultipleChoiceQuiz(functionCall.args.response, functionCall.args.content, functionCall.args.description);
            } else if (functionCall.name === 'create_fill_in_the_blanks') {
                finalData = createFillInTheBlanks(functionCall.args.response, functionCall.args.content, functionCall.args.description);
            } else if (functionCall.name === 'generate_notes') {
                finalData = generateNotes(functionCall.args.response, functionCall.args.content);
            }
            return finalData;
        }
    }
}


