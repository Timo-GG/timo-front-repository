import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownContentProps {
  fileUrl: string;
}

const MarkdownContent = ({ fileUrl }: MarkdownContentProps) => {
  const [content, setContent] = useState('');

  const markdownComponents = {
    h1: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h1 className="text-xl font-bold mb-2" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: { children?: React.ReactNode }) => (
      <h2 className="text-lg font-semibold mb-1" {...props}>
        {children}
      </h2>
    ),
    p: ({ children, ...props }: { children?: React.ReactNode }) => (
      <p className="text-sm mb-2" {...props}>
        {children}
      </p>
    ),
  };

  useEffect(() => {
    fetch(fileUrl)
      .then(res => res.text())
      .then(text => setContent(text))
      .catch(err => console.error(err));
  }, [fileUrl]);

  return (
    <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
  );
};

export default MarkdownContent;
