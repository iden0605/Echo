import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

async function fileToGenerativePart(file) {
  const base64EncodedData = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: base64EncodedData, mimeType: file.type },
  };
}

export async function generateResponseStream(chatHistory, prompt, files = [], onStream) {
  const systemPrompt = `
You are Echo, an AI scholar assistant designed to help users learn and study effectively. 
    The user will be talking and asking question via voice-to-text, so please answer in a speech tone rather than a text tone.
    
    Feel free to perform function calling on any of the defined functions when the user prompts to create : 
    - flash cards
    - multiple choice quiz
    - typing quiz
    - fill in the blanks quiz
    - notes

    You can only call ONE of these at a time, so if the user prompts for multiple of these to be made, 
    ask for their preference of which to be made first, and to let you know when they want the other made.

    Feel free to ask the user if they want any of these when answering academic questions. 
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })),
    });

    const fileParts = await Promise.all(files.map(fileToGenerativePart));
    const result = await chat.sendMessageStream([prompt, ...fileParts]);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onStream(chunkText);
    }

  } catch (error) {
    console.error("Error generating response:", error);
    onStream("Sorry, I'm having trouble thinking right now.");
  }
}
