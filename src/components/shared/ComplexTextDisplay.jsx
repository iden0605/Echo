import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { okaidia } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ComplexTextDisplay = ({ text }) => {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match) {
        return (
          <SyntaxHighlighter
            style={okaidia}
            language={match[1]}
            customStyle={{
              backgroundColor: '#1c1917',
              border: '1px solid #555',
              borderRadius: '0.25rem'
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    table: ({ node, ...props }) => <table className="table-auto w-full my-4 border border-stone-500" {...props} />,
    thead: ({ node, ...props }) => <thead className="bg-stone-700" {...props} />,
    tbody: ({ node, ...props }) => <tbody {...props} />,
    tr: ({ node, ...props }) => <tr className="border-b border-stone-600" {...props} />,
    th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-bold" {...props} />,
    td: ({ node, ...props }) => <td className="px-4 py-2 border-l border-stone-600" {...props} />,
  };

  return (
    <div className="whitespace-normal break-words notes-container">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default ComplexTextDisplay;
