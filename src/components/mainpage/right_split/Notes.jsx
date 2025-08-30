import React, { useState } from 'react';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';
import { FaCopy, FaDownload, FaCheck } from 'react-icons/fa';

const Notes = ({ content }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!content || !content.text) {
    return <div className="text-white">No notes available.</div>;
  }

  let parsedText = content.text;
  try {
    parsedText = JSON.parse(content.text);
  } catch (error) {
    parsedText = content.text;
  }

  const removeMarkdown = (text) => {
    return text
      .replace(/^#+\s/gm, '') // Remove headers
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // Remove bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // Remove italics
      .replace(/~~(.*?)~~/g, '$1') // Remove strikethrough
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1') // Remove inline and block code
      .replace(/^>\s/gm, '') // Remove blockquotes
      .replace(/^\s*[-*+]\s/gm, ''); // Remove list items
  };

  const handleCopy = () => {
    const textToCopy = typeof parsedText === 'string' ? parsedText : JSON.stringify(parsedText, null, 2);
    const plainText = removeMarkdown(textToCopy);
    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 700);
  };

  const handleDownload = () => {
    const textToDownload = typeof parsedText === 'string' ? parsedText : JSON.stringify(parsedText, null, 2);
    const plainText = removeMarkdown(textToDownload);
    const blob = new Blob([plainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 700);
  };

  return (
    <div className="w-full mx-auto p-6 bg-stone-800 rounded-lg shadow-lg text-white h-full flex flex-col notes-container overflow-x-hidden">
      <div className="flex justify-between items-center mb-4">
        {downloaded ? (
          <FaCheck className="text-white" title="Downloaded!" />
        ) : (
          <FaDownload
            className="text-white cursor-pointer hover:text-gray-300 transition-colors duration-200"
            onClick={handleDownload}
            title="Download notes"
          />
        )}
        {copied ? (
          <FaCheck className="text-white" title="Copied!" />
        ) : (
          <FaCopy
            className="text-white cursor-pointer hover:text-gray-300 transition-colors duration-200"
            onClick={handleCopy}
            title="Copy notes"
          />
        )}
      </div>
      <div className="overflow-y-auto flex-grow whitespace-normal break-words text-sm sm:text-base">
        <ComplexTextDisplay text={parsedText} />
      </div>
    </div>
  );
};

export default Notes;
