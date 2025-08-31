import React, { useState, useEffect } from 'react';
import ComplexTextDisplay from '../../shared/ComplexTextDisplay';
import { FaCopy, FaDownload, FaCheck, FaSave, FaEdit } from 'react-icons/fa';

const Notes = ({ content, onNotesUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (content && content.text) {
      setEditedText(content.text);
    }
  }, [content]);

  if (!content || !content.text) {
    return <div className="text-white">No notes available.</div>;
  }

  let parsedText = content.text;
  try {
    parsedText = JSON.parse(content.text);
  } catch (error) {
    parsedText = content.text;
  }

  const handleDoubleClick = () => {
    if (!isMobile) {
      setIsEditing(true);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onNotesUpdate(editedText);
    setIsEditing(false);
  };

  const removeMarkdown = (text) => {
    return text
      .replace(/^#+\s/gm, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
      .replace(/^>\s/gm, '')
      .replace(/^\s*[-*+]\s/gm, '');
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
    <div
      className="w-full mx-auto p-6 bg-stone-800 rounded-lg shadow-lg text-white flex flex-col notes-container overflow-x-hidden"
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          {isEditing ? (
            <FaSave
              className="text-white cursor-pointer hover:text-gray-300 transition-colors duration-200"
              onClick={handleSave}
              title="Save notes"
            />
          ) : (
            <FaEdit
              className="text-white cursor-pointer hover:text-gray-300 transition-colors duration-200"
              onClick={handleEdit}
              title="Edit notes"
            />
          )}
        </div>
        <div className="flex items-center">
          {!isEditing && (
            <>
              {downloaded ? (
                <FaCheck className="text-white ml-4" title="Downloaded!" />
              ) : (
                <FaDownload
                  className="text-white cursor-pointer hover:text-gray-300 transition-colors duration-200 ml-4"
                  onClick={handleDownload}
                  title="Download notes"
                />
              )}
              {copied ? (
                <FaCheck className="text-white ml-4" title="Copied!" />
              ) : (
                <FaCopy
                  className="text-white cursor-pointer hover:text-gray-300 transition-colors duration-200 ml-4"
                  onClick={handleCopy}
                  title="Copy notes"
                />
              )}
            </>
          )}
        </div>
      </div>
      <div className="overflow-y-hidden h-full flex-grow whitespace-normal break-words text-sm sm:text-base">
        {isEditing ? (
          <textarea
            className="w-full overflow-y-hidden bg-stone-700 text-white p-2 rounded resize-none"
            rows={Math.max(5, editedText.split('\n').length)}
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
          />
        ) : (
          <ComplexTextDisplay text={parsedText} />
        )}
      </div>
    </div>
  );
};

export default Notes;
