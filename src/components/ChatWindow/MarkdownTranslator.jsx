import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownTranslator = ({
    content,
    className = "",
    isStreaming = false,
}) => {
    const [displayedContent, setDisplayedContent] = useState("");
    const [isAnimating, setIsAnimating] = useState(false);
    const animationRef = useRef(null);
    const timeoutRef = useRef(null);
    const previousStreamingStateRef = useRef(false);
    const STREAMING_SPEED = 500

    useEffect(() => {
        // Clean up previous animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (!content) {
            setDisplayedContent("");
            setIsAnimating(false);
            previousStreamingStateRef.current = false;
            return;
        }

        // Check if streaming state changed from false to true (trigger re-animation)
        const streamingStarted = isStreaming && !previousStreamingStateRef.current;
        
        // Update the streaming state reference
        previousStreamingStateRef.current = isStreaming;

        // If not streaming, show content immediately
        if (!isStreaming) {
            setDisplayedContent(content);
            setIsAnimating(false);
            return;
        }

        // If streaming just started or content changed while streaming
        if (streamingStarted || isStreaming) {
            
            setIsAnimating(true);
            setDisplayedContent(""); // Always start from empty when streaming starts

            let currentIndex = 0;
            const totalLength = content.length;
            let lastTime = Date.now();
            
            // Calculate characters to add per frame based on speed
            const charsPerSecond = STREAMING_SPEED;
            const targetFrameRate = 60; 
            const charsPerFrame = charsPerSecond / targetFrameRate;

            const animateText = () => {
                const now = Date.now();
                const deltaTime = (now - lastTime) / 1000; // Convert to seconds
                
                // Calculate how many characters to add this frame
                const charsToAdd = Math.max(1, Math.ceil(charsPerFrame * deltaTime * targetFrameRate));
                
                if (currentIndex < totalLength && isStreaming) {
                    currentIndex = Math.min(currentIndex + charsToAdd, totalLength);
                    const newContent = content.substring(0, currentIndex);
                    setDisplayedContent(newContent);
                    lastTime = now;
                    animationRef.current = requestAnimationFrame(animateText);
                } else {
                    // Animation complete or streaming stopped
                    setIsAnimating(false);
                    setDisplayedContent(content);
                    animationRef.current = null;
                }
            };

            // Start animation immediately
            lastTime = Date.now();
            animationRef.current = requestAnimationFrame(animateText);
        }

        // Cleanup function
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [content, isStreaming, STREAMING_SPEED]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

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
                        showLineNumbers={!isAnimating}
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
        [isAnimating]
    );

    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            <ReactMarkdown
                components={components}
                remarkPlugins={[remarkGfm]}
                skipHtml={false}
            >
                {displayedContent}
            </ReactMarkdown>
            {isAnimating && (
                <span className="inline-flex items-center ml-1">
                    <span 
                        className="w-2 h-5 bg-orange-500 rounded-sm"
                        style={{
                            animation: 'claude-cursor 1.2s ease-in-out infinite',
                        }}
                    />
                </span>
            )}
            <style jsx>{`
                @keyframes claude-cursor {
                    0%, 50% { opacity: 1; background-color: #f97316; }
                    51%, 100% { opacity: 0.3; background-color: #fb923c; }
                }
            `}</style>
        </div>
    );
};

export default MarkdownTranslator;