import { useState, useEffect, useRef } from "react";

const useSpeechToText = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const finalTranscriptRef = useRef('');
  const [transcript, setTranscript] = useState("");

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      console.error("Web Speech API is not supported by this browser.");
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const newRecognition = new SpeechRecognition();
    newRecognition.continuous = true;
    newRecognition.interimResults = true;
    newRecognition.lang = 'en-US';
    newRecognition.maxAlternatives = 1;

    newRecognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const currentTranscript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += currentTranscript;
        } 
        else {
          interimTranscript += currentTranscript;
        }
      }
      setTranscript(finalTranscriptRef.current + interimTranscript);
    };

    newRecognition.onend = () => {
      setIsRecording(false);
      finalTranscriptRef.current = '';
      console.log("Speech recognition ended.");
    };

    newRecognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      finalTranscriptRef.current = '';
    };

    setRecognition(newRecognition);

    return () => {
      if (newRecognition) {
        newRecognition.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognition) {
      finalTranscriptRef.current = '';
      setTranscript("");
      setIsRecording(true);
      recognition.start();
      console.log("Speech recognition started.");
    }
  };

  const stopRecording = () => {
    if (recognition) {
      setIsRecording(false);
      recognition.stop();
      console.log("Speech recognition stopped.");
    }
  };

  return {
    isRecording,
    transcript,
    startRecording,
    stopRecording,
    setTranscript
  };
};

export default useSpeechToText;
