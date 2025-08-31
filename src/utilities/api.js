import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper functions from func.py
function createFlashcards(response, content) {
    return {
        response: response,
        type: "flashcard",
        content: content
    };
}

function createMultipleChoiceQuiz(response, content, description) {
    return {
        response: response,
        type: "multi_quiz",
        content: content,
        desc: description,
    };
}

function createFillInTheBlanks(response, content, description) {
    return {
        response: response,
        type: "blanks_quiz",
        content: content,
        desc: description,
    };
}

function generateNotes(response, content) {
    return {
        response: response,
        type: "notes",
        content: content
    };
}

// Function Declarations for Gemini API
const createFlashcardsFunction = {
    name: "create_flashcards",
    description: "Creates flashcards from a provided text or topic.",
    parameters: {
        type: "object",
        properties: {
            response: {
                type: "string",
                description: "A response about the flashcards generated and the user's input."
            },
            content: {
                type: "object",
                description: "A dictionary where each key is a question and the corresponding value is its answer."
            },
        },
        required: ["response", "content"]
    }
};

const createMultiQuizFunction = {
    name: "create_multiple_choice_quiz",
    description: "Creates a multiple-choice quiz from a provided text or topic, or uses provided quiz data.",
    parameters: {
        type: "object",
        properties: {
            response: {
                type: "string",
                description: "A response about the multiple-choice quiz generated and the user's input."
            },
            content: {
                type: "object",
                description: "A dictionary where each key is a question and the value is a list of strings, with the first string being the correct answer."
            },
            description: {
                type: "object",
                description: "A dictionary where each key is a question and the value is the explanation on the answer."
            },
        },
        required: ["response", "content", "description"]
    }
};

const createBlanksQuizFunction = {
    name: "create_fill_in_the_blanks",
    description: "Creates a fill-in-the-blanks exercise from a text or topic.",
    parameters: {
        type: "object",
        properties: {
            response: {
                type: "string",
                description: "A response about the fill-in-the-blanks quiz generated and the user's input."
            },
            content: {
                type: "object",
                description: "A dictionary where each key is a question containing '_____' and the corresponding value is the answer."
            },
            description: {
                type: "object",
                description: "A dictionary where each key is a question containing '_____' and the corresponding value is the explanation on the answer."
            },
        },
        required: ["response", "content", "description"]
    }
};

const createNotesFunction = {
    name: "generate_notes",
    description: "Generates structured and summarized notes on a given topic or text.",
    parameters: {
        type: "object",
        properties: {
            response: {
                type: "string",
                description: "A response about the notes generated and the user's input."
            },
            content: {
                type: "object",
                properties: {
                    text: {
                        type: "string",
                        description: "The generated notes, formatted with headings, bullet points, and bolded keywords."
                    }
                },
                required: ["text"]
            },
        },
        required: ["response", "content"]
    }
};

// Configure Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const genAI2 = new GoogleGenerativeAI(GEMINI_API_KEY);

// Function calling tool
const tools = {
    functionDeclarations: [
        createFlashcardsFunction,
        createMultiQuizFunction,
        createBlanksQuizFunction,
        createNotesFunction
    ]
};
const config = { tools: [tools] };

const sys1 = `
    Echo is a AI scholar assistant that answers through voice and can create : 
    - flashcards
    - quizzes (multiple choice, 4 options)
    - fill in the blanks
    - generate notes for better learning experiences
    by calling functions

    You will be given an input text of a conversation between the user and Echo. 
    Your task is to identify if the user's latest text requires just 'a response' or 'a response with a function calling.'

    if only a response is required, answer with : respondonly
    if a response and a function calling is required, repond with one of these : 
        flashcard
        multi_quiz
        blanks_quiz
        notes

    if the user is asking for more than one of the functions, respond with : multifunction
    (if a user asks a question and wants a something that requires a function calling, thats classified as 'a response with a function calling.')
    (eg: what sizes of all the planets? Also make me flash cards for them. ) <- this is classified as 'a response with a function calling.' not multifunction

    if the user asks for a quiz, but did not specify which kind, respond with : quizz

    DO NOT RESPOND WITH ANYTHING ELSE

    addtional notes : 
    - user may prompt with various languages, take that into account when trying to identify how to categorise they response
    - user response may be a reply to previous text, refer to the whole conversation's context top better categorise utilities
    - if the user asks for one of the above, but there isnt enough context/specification for any of those to be made, classify it as respondonly
    `;

const sys2 = (h) => `
    You are Echo, an AI scholar assistant designed to help users learn and study effectively. 
    The user will be talking and asking question via voice-to-text, 
    and will be receiving your response via TTS,
    so please give a response in a speech tone rather than a text tone.

    Feel free to perform function calling on any of the defined functions when the user prompts to create any of these: 
    - flash cards
    - multiple choice quiz
    - fill in the blanks quiz
    - notes

    Feel free to ask the user if they want any of these when answering academic questions.

    You can only perform ONE function call at a time, 
    so if the user asks for more than one of those, asks them what do they want first.

    Additional notes to remember : 
    - and if the user asks for quiz, but did not specify which kind, kindly ask them which kind they want and list the available kinds.
    - if the user asks for something outside of these scopes, let them know you can't do it.
    - for longer responses, try to format responses in a more aesthetic way (eg: titles, emojis if needed .etc)
    - if the user asks for one of the above, but there isnt enough context/specification for any of those to be made, ask them for context/specifications

    For additional context, here is the chat history : 
    ${h}
`;

const sys3 = (f, h) => `
    You are Echo, an AI scholar assistant designed to help users learn and study effectively by using premade functions. 

    According to the input, use the function ${f}.

    the input should contain the context needed to use the respective functions required.
    you MUST use the function given.

    Here are some additional notes to remember: 
    - try to format notes in an aesthetic way (eg: spacing, headers, titles, seperators, bold/italics .etc).
    - for longer responses, try to format responses in a more aesthetic way (eg: titles, emojis if needed .etc).
    - in the event where the user does not specify how many questions they want when generating a quiz, avoid generating less than 5 questions.

    For additional context, here is the chat history : 
    ${h}
`;

function returnVal(response, valtype, content) {
    const tempdict = {
        response: response,
        type: valtype,
        content: content
    };
    return tempdict;
}

async function uploadFiles(files) {
    const uploadedFiles = [];

    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = reader.result.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(file);
        });
    }

    for (const file of files) {
        try {
            const base64Data = await readFileAsBase64(file);
            uploadedFiles.push({
                mimeType: file.type,
                data: base64Data,
            });
        } catch (error) {
            console.error("Error reading file:", error);
        }
    }
    return uploadedFiles;
}

export async function generateText(prompt, history, files = [], signal) {
    let uploadedFiles = [];
    if (files && files.length > 0) {
        uploadedFiles = await uploadFiles(files);
    }

    let functionToCall = "";
    let respondonly = false;

    // check for the type of output ------------------
    let contentsss;
    let contentss;

    if (uploadedFiles.length > 0) {
        contentsss = [{ text: "Chat history context : \n\n" + JSON.stringify(history) + `\n\nLatest user input : ${prompt}` }];
        contentss = [{ text: prompt }];
        for (const fileData of uploadedFiles) {
            contentsss.push({ inlineData: fileData });
            contentss.push({ inlineData: fileData });
        }
    } else {
        contentsss = [{ text: "Chat history context : \n\n" + JSON.stringify(history) + `\n\nLatest user input : ${prompt}` }];
        contentss = [{ text: prompt }];
    }

    const model1 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const response1 = await model1.generateContent({
        systemInstruction: sys1,
        contents: [{ role: "user", parts: contentsss }]
    }, { signal });

    if (signal.aborted) return { response: "", type: "none", content: "" };

    const r = response1.response.text();

    if (r.includes('respondonly') || r.includes('multifunction') || r.includes('quizz')) {
        respondonly = true;
    } else if (r.includes('flashcard')) {
        functionToCall = 'create_flashcards';
    } else if (r.includes('multi_quiz')) {
        functionToCall = 'create_multiple_choice_quiz';
    } else if (r.includes('blanks_quiz')) {
        functionToCall = 'create_fill_in_the_blanks';
    } else if (r.includes('notes')) {
        functionToCall = 'generate_notes';
    }
    // -----------------------------------------------
    console.log(`respondonly : ${respondonly}`);

    let r2 = "";

    // no need to continue since no function call is needed
    if (respondonly) {
        const model2 = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const response2 = await model2.generateContent({
            systemInstruction: sys2(history),
            contents: [{ role: "user", parts: contentss }]
        }, { signal });
        if (signal.aborted) return { response: "", type: "none", content: "" };
        r2 = response2.response.text();
        return returnVal(r2, null, null);
    }

    // function calling version
    const attempt = 3;
    let art = returnVal("Sorry, I seem to have encountered a problem, please try again", null, null);

    for (let i = 0; i < attempt; i++){
        
        const model3 = genAI2.getGenerativeModel({ model: "gemini-2.5-flash", tools: [tools] });
        const response3 = await model3.generateContent({
            systemInstruction: sys3(functionToCall, history),
            contents: [{ role: "user", parts: contentss }]
        }, { signal });
        
        if (signal.aborted) return { response: "", type: "none", content: "" };

        const functionCalls = response3.response.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
            const functionCall = functionCalls[0];
            if (functionCall.name === 'create_flashcards') {
                art = createFlashcards(functionCall.args.response, functionCall.args.content);
            } else if (functionCall.name === 'create_multiple_choice_quiz') {
                art = createMultipleChoiceQuiz(functionCall.args.response, functionCall.args.content, functionCall.args.description);
            } else if (functionCall.name === 'create_fill_in_the_blanks') {
                art = createFillInTheBlanks(functionCall.args.response, functionCall.args.content, functionCall.args.description);
            } else if (functionCall.name === 'generate_notes') {
                art = generateNotes(functionCall.args.response, functionCall.args.content);
            }
            console.log(art);
            break;
        }
    }
    return art;
}
