import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownTranslator = ({ content, className = "", isStreaming = false }) => {

    const components = useMemo(() => ({
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeContent = String(children).replace(/\n$/, "");
            
            return !inline && match ? (
                <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md my-2"
                    showLineNumbers={!isStreaming}
                    {...props}
                >
                    {codeContent}
                </SyntaxHighlighter>
            ) : (
                <code
                    className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-red-600"
                    {...props}
                >
                    {children}
                </code>
            );
        },
        // Custom paragraph renderer
        p({ children }) {
            return (
                <p className="mb-3 leading-relaxed text-gray-800">{children}</p>
            );
        },
        // Custom list renderers with better spacing
        ul({ children }) {
            return (
                <ul className="mb-4 pl-6 space-y-2 list-disc">{children}</ul>
            );
        },
        ol({ children }) {
            return (
                <ol className="mb-4 pl-6 space-y-2 list-decimal">{children}</ol>
            );
        },
        li({ children }) {
            return (
                <li className="leading-relaxed text-gray-800 py-1 pl-1">
                    {children}
                </li>
            );
        },
        // Custom heading renderers
        h1({ children }) {
            return (
                <h1 className="text-2xl font-bold mb-4 text-gray-900">
                    {children}
                </h1>
            );
        },
        h2({ children }) {
            return (
                <h2 className="text-xl font-semibold mb-3 text-gray-900">
                    {children}
                </h2>
            );
        },
        h3({ children }) {
            return (
                <h3 className="text-lg font-medium mb-2 text-gray-900">
                    {children}
                </h3>
            );
        },
        h4({ children }) {
            return (
                <h4 className="text-base font-medium mb-2 text-gray-900">
                    {children}
                </h4>
            );
        },
        h5({ children }) {
            return (
                <h5 className="text-sm font-medium mb-2 text-gray-900">
                    {children}
                </h5>
            );
        },
        h6({ children }) {
            return (
                <h6 className="text-xs font-medium mb-2 text-gray-900">
                    {children}
                </h6>
            );
        },
        // Custom blockquote renderer
        blockquote({ children }) {
            return (
                <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 mb-3 bg-blue-50 py-2 rounded-r-md">
                    {children}
                </blockquote>
            );
        },
        // Custom table renderers
        table({ children }) {
            return (
                <div className="overflow-x-auto mb-4">
                    <table className="min-w-full border-collapse border border-gray-300 rounded-md">
                        {children}
                    </table>
                </div>
            );
        },
        thead({ children }) {
            return <thead className="bg-gray-50">{children}</thead>;
        },
        th({ children }) {
            return (
                <th className="border border-gray-300 px-4 py-2 font-semibold text-left text-gray-900">
                    {children}
                </th>
            );
        },
        td({ children }) {
            return (
                <td className="border border-gray-300 px-4 py-2 text-gray-800">
                    {children}
                </td>
            );
        },
        // Custom link renderer
        a({ href, children }) {
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline transition-colors duration-200"
                >
                    {children}
                </a>
            );
        },
        // Custom strong/bold renderer
        strong({ children }) {
            return (
                <strong className="font-semibold text-gray-900">
                    {children}
                </strong>
            );
        },
        // Custom emphasis/italic renderer
        em({ children }) {
            return <em className="italic text-gray-800">{children}</em>;
        },
        // Custom horizontal rule
        hr() {
            return <hr className="my-4 border-gray-300" />;
        },
    }), [isStreaming]);

    // Process content for streaming to handle incomplete markdown gracefully
    const processedContent = useMemo(() => {
        if (!content) return "";
        
        let processedText = content;
        
        // Handle incomplete markdown during streaming
        if (isStreaming) {
            // Count code block markers to ensure proper rendering
            const codeBlockMatches = processedText.match(/```/g) || [];
            const openCodeBlocks = codeBlockMatches.length;
            
            // If we have an odd number of code block markers, the block is incomplete
            if (openCodeBlocks % 2 !== 0) {
                // Let ReactMarkdown handle it gracefully - don't modify
            }
            
            // Handle incomplete list items
            if (processedText.match(/\n[-*+]\s*$/)) {
                processedText += " ";
            }
            
            // Handle incomplete numbered lists
            if (processedText.match(/\n\d+\.\s*$/)) {
                processedText += " ";
            }
            
            // Handle incomplete headers
            if (processedText.match(/\n#+\s*$/)) {
                processedText += " ";
            }
        }
        
        return processedText;
    }, [content, isStreaming]);

    return (
        <div className={`prose prose-sm max-w-none ${className} ${isStreaming ? 'streaming-markdown' : ''}`}>
            <ReactMarkdown 
                components={components} 
                remarkPlugins={[remarkGfm]}
                skipHtml={false}
            >
                {processedContent}
            </ReactMarkdown>
            {isStreaming && (
                <span className="inline-flex items-center ml-1">
                    <span className="w-2 h-4 bg-blue-500 animate-pulse opacity-75 rounded-sm"></span>
                </span>
            )}
        </div>
    );
};

export default MarkdownTranslator;