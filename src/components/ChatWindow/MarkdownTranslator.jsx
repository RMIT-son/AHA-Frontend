import React, { useMemo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import { MarkdownStreamParser } from "@lixpi/markdown-stream-parser";

const MarkdownTranslator = ({
    content,
    className = "",
    isStreaming = false,
    sessionId = "default-session",
    onStreamComplete = () => {},
}) => {
    const [parsedContent, setParsedContent] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const parserInstanceRef = useRef(null);
    const unsubscribeRef = useRef(null);
    const lastProcessedLength = useRef(0);

    // Initialize parser and set up subscription
    useEffect(() => {
        if (!isStreaming) {
            // Reset for non-streaming mode
            setParsedContent("");
            setIsComplete(false);
            lastProcessedLength.current = 0;
            return;
        }

        try {
            // Get or create parser instance
            parserInstanceRef.current =
                MarkdownStreamParser.getInstance(sessionId);

            // Subscribe to parser output
            unsubscribeRef.current =
                parserInstanceRef.current.subscribeToTokenParse(
                    (parsedSegment, unsubscribe) => {
                        if (parsedSegment.status === "END_STREAM") {
                            setIsComplete(true);
                            onStreamComplete();
                            // Clean up when stream ends
                            if (unsubscribe) unsubscribe();
                            MarkdownStreamParser.removeInstance(sessionId);
                            parserInstanceRef.current = null;
                            unsubscribeRef.current = null;
                        } else if (
                            parsedSegment.status === "STREAMING" &&
                            parsedSegment.segment
                        ) {
                            // Process the segment and update content
                            setParsedContent(
                                (prev) =>
                                    prev + formatSegment(parsedSegment.segment)
                            );
                        }
                    }
                );

            // Start the parsing process
            parserInstanceRef.current.startParsing();
        } catch (error) {
            console.error("Error initializing MarkdownStreamParser:", error);
        }

        // Cleanup function
        return () => {
            if (unsubscribeRef.current) {
                try {
                    unsubscribeRef.current();
                } catch (e) {
                    console.warn("Error during unsubscribe:", e);
                }
                unsubscribeRef.current = null;
            }

            if (parserInstanceRef.current) {
                try {
                    parserInstanceRef.current.stopParsing();
                    MarkdownStreamParser.removeInstance(sessionId);
                } catch (e) {
                    console.warn("Error during parser cleanup:", e);
                }
                parserInstanceRef.current = null;
            }
        };
    }, [isStreaming, sessionId, onStreamComplete]);

    // Process new content chunks
    useEffect(() => {
        if (isStreaming && parserInstanceRef.current && content) {
            try {
                // Only process new content that hasn't been processed yet
                const newContent = content.slice(lastProcessedLength.current);
                if (newContent.length > 0) {
                    parserInstanceRef.current.parseToken(newContent);
                    lastProcessedLength.current = content.length;
                }
            } catch (error) {
                console.error("Error parsing token:", error);
            }
        }
    }, [content, isStreaming]);

    // Format parsed segment into markdown
    const formatSegment = (segment) => {
        let text = segment.segment || "";

        // Apply inline styles
        if (segment.styles && Array.isArray(segment.styles)) {
            segment.styles.forEach((style) => {
                switch (style) {
                    case "bold":
                        text = `**${text}**`;
                        break;
                    case "italic":
                        text = `*${text}*`;
                        break;
                    case "strikethrough":
                        text = `~~${text}~~`;
                        break;
                    case "code":
                        text = `\`${text}\``;
                        break;
                    default:
                        // Handle other styles if needed
                        break;
                }
            });
        }

        // Handle block-level formatting
        if (segment.isBlockDefining) {
            switch (segment.type) {
                case "heading":
                    // Headers should already be properly formatted from the parser
                    return text;
                case "paragraph":
                    return text;
                case "code-block":
                    return text;
                case "blockquote":
                    return text;
                default:
                    return text;
            }
        }

        return text;
    };

    // Stop streaming manually (useful for external control)
    const stopStreaming = () => {
        if (parserInstanceRef.current) {
            try {
                parserInstanceRef.current.stopParsing();
            } catch (error) {
                console.error("Error stopping parser:", error);
            }
        }
    };

    // Expose stop function via imperative handle if needed
    React.useImperativeHandle(
        React.forwardRef(() => null),
        () => ({
            stopStreaming,
        })
    );

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

    // Determine what content to render
    const contentToRender = isStreaming ? parsedContent : content || "";

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
                {contentToRender}
            </ReactMarkdown>
            {isStreaming && !isComplete && (
                <span className="inline-flex items-center ml-1">
                    <span className="w-2 h-4 bg-blue-500 animate-pulse opacity-75 rounded-sm"></span>
                </span>
            )}
        </div>
    );
};

export default MarkdownTranslator;
