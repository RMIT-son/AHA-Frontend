import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownTranslator = ({ content, className = "" }) => {
    // Enhanced content cleaning to fix spacing issues from streaming
    const cleanContent = content
        // First, remove the streaming data format
        ?.replace(/data:\s*/g, "") // Remove "data: " prefixes
        ?.replace(/\[DONE\]/g, "") // Remove [DONE] markers

        // Fix spacing issues with emojis and text concatenation (but avoid breaking numbers)
        ?.replace(/([a-zA-Z])(\d+)(?!\d)/g, "$1 $2") // Add space between word and number, but not within numbers
        ?.replace(/(🥤)\s*([A-Z])/g, "$1\n\n$2") // Specific fix for 🥤 emoji
        ?.replace(/([🌟💊🤒🤕🦠🤧🥴🚽💨❤️😴😊])\s*([A-Z])/g, "$1\n\n$2") // Line break after other emojis before capital letter
        ?.replace(/([.!?])\s*([A-Z])/g, "$1 $2") // Ensure space after sentence endings within same paragraph

        // Handle numbered lists that get streamed as one line
        ?.replace(/(\d+)\.\s*/g, "\n$1. ") // Convert "1. " to newline + "1. "
        ?.replace(/^(\d+)\.\s*/, "$1. ") // Fix first numbered item

        // Handle bullet lists that get streamed as one line
        ?.replace(/\s*-\s*([^-\n])/g, "\n- $1") // Convert " - item" to newline + "- item"
        ?.replace(/^-\s*/, "- ") // Fix first bullet item

        // Clean up excessive whitespace while preserving line structure
        ?.split("\n") // Split into lines
        .map((line) => line.replace(/\s+/g, " ").trim()) // Clean each line individually
        .filter((line) => line.length > 0) // Remove empty lines
        .join("\n") // Rejoin with newlines

        ?.replace(/\s+(['"])/g, "$1") // Remove spaces before quotes
        ?.replace(/(['"])\s+/g, "$1 "); // Ensure single space after quotes

    const components = {
        // Custom code block renderer
        code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
                <SyntaxHighlighter
                    style={tomorrow}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md my-2"
                    {...props}
                >
                    {String(children).replace(/\n$/, "")}
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
    };

    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            <ReactMarkdown components={components} remarkPlugins={[remarkGfm]}>
                {cleanContent || ""}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownTranslator;
