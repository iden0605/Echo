import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { InlineMath } from 'react-katex';

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
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    p: ({ node, ...props }) => {
      const children = React.Children.toArray(props.children);
      const newChildren = children.map((child, index) => {
        if (typeof child === 'string') {
          const parts = child.split(/(\$.*?\$)/g);
          return parts.map((part, i) => 
            part.startsWith('$') && part.endsWith('$') ? <InlineMath key={`${index}-${i}`} math={part.slice(1, -1)} /> : part
          );
        }
        return child;
      });
      return <p {...props}>{newChildren}</p>;
    }
  };

  return (
    <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
      {text}
    </ReactMarkdown>
  );
};

export default ComplexTextDisplay;
