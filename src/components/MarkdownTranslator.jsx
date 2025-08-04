import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownTranslator = ({
    content,
    className = "",
    isStreaming = false,
}) => {
    // Preprocess content to fix streaming formatting issues
    const processedContent = useMemo(() => {
        if (!content) return content;

        let processed = content;

        try {
            // Check if this looks like a single-line list (common during streaming)
            const isSingleLineNumberedList =
                content.includes("1.") &&
                content.includes("2.") &&
                !content.includes("\n");

            // Check if this looks like a single-line bulleted list with bold headers
            const isSingleLineBulletList =
                content.includes("* **") &&
                content.match(/\* \*\*[^*]+\*\*:/g) &&
                content.match(/\* \*\*[^*]+\*\*:/g).length > 1 &&
                !content.includes("\n");

            if (isSingleLineNumberedList) {
                // Fix spacing issues like "are10" -> "are 10"
                processed = processed.replace(/([a-zA-Z])(\d+)/g, "$1 $2");

                // Fix "type2" -> "type 2"
                processed = processed.replace(/type(\d+)/g, "type $1");

                // Insert line breaks before numbered items
                processed = processed.replace(/(\d+\.\s)/g, "\n$1");

                // Fix cases where text runs into next sentence after emoji
                processed = processed.replace(
                    /([\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]+)([A-Z])/gu,
                    "$1\n\n$2"
                );

                // Clean up: remove the leading newline if it exists
                processed = processed.replace(/^\n/, "");

                // Handle the specific "uses:" pattern
                processed = processed.replace(
                    /(uses?:)\n(\d+\.\s)/gi,
                    "$1\n\n$2"
                );
            } else if (isSingleLineBulletList) {
                // Handle bulleted lists with bold headers

                // First, fix any text that runs into bullet points after periods or colons
                processed = processed.replace(
                    /([.:])\s*\*\s*\*\*/g,
                    "$1\n* **"
                );

                // Insert line breaks before bullet points with bold headers
                // This pattern matches: "- **Header**: content" or "* **Header**: content"
                processed = processed.replace(
                    /([.!?:])\s*[-*]\s*\*\*([^*]+)\*\*:/g,
                    "$1\n* **$2**:"
                );

                // Also handle cases where bullet points are right after text without punctuation
                processed = processed.replace(
                    /([a-zA-Z0-9)])\s*[-*]\s*\*\*([^*]+)\*\*:/g,
                    "$1\n* **$2**:"
                );

                // Fix cases where emojis run into the next bullet point
                processed = processed.replace(
                    /([\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]+)\s*[-*]\s*\*\*([^*]+)\*\*:/gu,
                    "$1\n* **$2**:"
                );

                // Handle "Overall," or similar transition words that should be on new lines
                processed = processed.replace(
                    /([.!?:])\s*(Overall|In conclusion|Finally|Additionally|Furthermore),/gi,
                    "$1\n\n$2,"
                );

                // Clean up any double newlines that might have been created
                processed = processed.replace(/\n\n\n+/g, "\n\n");

                // Clean up: remove the leading newline if it exists
                processed = processed.replace(/^\n/, "");
            }

            // General fixes for streaming content

            // Fix spacing issues like "are10" -> "are 10" (for all content)
            processed = processed.replace(/([a-zA-Z])(\d+)/g, "$1 $2");

            // Fix cases where text runs into next sentence after emoji (for all content)
            processed = processed.replace(
                /([\u{1F000}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{200D}]+)([A-Z][a-z])/gu,
                "$1\n\n$2"
            );
        } catch (error) {
            console.warn("❌ Error processing markdown content:", error);
            processed = content;
        }

        return processed;
    }, [content]);

    const components = useMemo(
        () => ({
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
            p({ children }) {
                return (
                    <p className="mb-3 leading-relaxed text-gray-800">
                        {children}
                    </p>
                );
            },
            ul({ children }) {
                return (
                    <ul className="mb-4 pl-6 space-y-2 list-disc">
                        {children}
                    </ul>
                );
            },
            ol({ children }) {
                return (
                    <ol className="mb-4 pl-6 space-y-2 list-decimal">
                        {children}
                    </ol>
                );
            },
            li({ children }) {
                return (
                    <li className="leading-relaxed text-gray-800 py-1 pl-1">
                        {children}
                    </li>
                );
            },
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
            blockquote({ children }) {
                return (
                    <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-700 mb-3 bg-blue-50 py-2 rounded-r-md">
                        {children}
                    </blockquote>
                );
            },
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
            strong({ children }) {
                return (
                    <strong className="font-semibold text-gray-900">
                        {children}
                    </strong>
                );
            },
            em({ children }) {
                return <em className="italic text-gray-800">{children}</em>;
            },
            hr() {
                return <hr className="my-4 border-gray-300" />;
            },
        }),
        [isStreaming]
    );

    // Always render markdown, regardless of streaming state
    return (
        <div
            className={`prose prose-sm max-w-none ${className} ${
                isStreaming ? "streaming-markdown" : ""
            }`}
        >
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
