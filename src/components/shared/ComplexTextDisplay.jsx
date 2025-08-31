import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ComplexTextDisplay = ({ text }) => {
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      if (!inline && match) {
        return (
          <SyntaxHighlighter
            style={dark}
            language={match[1]}
            PreTag="div"
            customStyle={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
  };

  return (
    <div className="whitespace-normal break-words">
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export default ComplexTextDisplay;
