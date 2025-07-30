import { useMemo } from "react";

const MarkdownWrapper = ({ content, isStreaming = false }) => {
    // Define all helper functions first
    const improveTextFormatting = (text) => {
        // Fix common concatenation issues and improve text spacing

        // Add spaces between words that are incorrectly concatenated
        // Handle patterns like "wordAnotherword" -> "word Another word"
        text = text.replace(/([a-z])([A-Z])/g, "$1 $2");

        // Fix numbered lists - look for pattern like "number . text number ."
        text = text.replace(
            /(\d+)\s*\.\s*([^.]*?)(\d+)\s*\./g,
            (match, num1, content, num2) => {
                return `\n${num1}. ${content.trim()}\n${num2}.`;
            }
        );

        // Handle the last item in a numbered list
        text = text.replace(
            /(\d+)\s*\.\s*([^.]*?)(?=\s*If\s|$)/g,
            (match, num, content) => {
                return `\n${num}. ${content.trim()}`;
            }
        );

        // Fix spacing issues with common patterns

        // Add space after periods followed by capital letters (sentence breaks)
        text = text.replace(/\.([A-Z])/g, ". $1");

        // Add space after colons when followed by letters
        text = text.replace(/:([A-Z])/g, ": $1");

        // Add space after commas if missing
        text = text.replace(/,([A-Z])/g, ", $1");

        // Add space after closing parentheses followed by letters/numbers
        text = text.replace(/\)([A-Za-z0-9])/g, ") $1");

        // Add space before opening parentheses when preceded by letters
        text = text.replace(/([a-z])\(/g, "$1 (");

        // Fix spacing around common words that might be concatenated
        text = text.replace(
            /\b(and|or|the|with|for|to|in|on|at|by|from|a|an|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|could|should|may|might|can)([A-Z])/g,
            "$1 $2"
        );

        // Fix concatenated sentences (lowercase letter followed by uppercase)
        text = text.replace(/([a-z])([A-Z][a-z])/g, "$1 $2");

        // Clean up multiple spaces
        text = text.replace(/\s+/g, " ");

        // Clean up excessive line breaks but preserve intentional formatting
        text = text.replace(/\n\s+/g, "\n");
        text = text.replace(/\n{3,}/g, "\n\n");

        return text.trim();
    };

    const applyMarkdownFormatting = (text) => {
        // Escape HTML to prevent XSS
        const escapeHtml = (str) => {
            const div = document.createElement("div");
            div.textContent = str;
            return div.innerHTML;
        };

        // Escape HTML first
        text = escapeHtml(text);

        // Handle code blocks first (to avoid conflicts with other formatting)
        text = text.replace(
            /```(\w+)?\n?([\s\S]*?)```/g,
            (match, lang, code) => {
                const language = lang || "text";
                return `<pre class="code-block" data-language="${language}"><code>${code.trim()}</code></pre>`;
            }
        );

        // Handle inline code (but not within code blocks)
        text = text.replace(
            /(?<!<pre[^>]*>[\s\S]*?)`([^`\n]+)`(?![\s\S]*?<\/pre>)/g,
            '<code class="inline-code">$1</code>'
        );

        // Handle headers (must be at start of line or after line break)
        text = text.replace(
            /(^|\n)### (.*?)(?=\n|$)/g,
            '$1<h3 class="header-3">$2</h3>'
        );
        text = text.replace(
            /(^|\n)## (.*?)(?=\n|$)/g,
            '$1<h2 class="header-2">$2</h2>'
        );
        text = text.replace(
            /(^|\n)# (.*?)(?=\n|$)/g,
            '$1<h1 class="header-1">$2</h1>'
        );

        // Handle bold and italic (avoid conflicts with code)
        // Triple asterisks for bold+italic
        text = text.replace(
            /\*\*\*((?:(?!\*\*\*)[\s\S])*?)\*\*\*/g,
            "<strong><em>$1</em></strong>"
        );
        // Double asterisks for bold
        text = text.replace(
            /\*\*((?:(?!\*\*)[\s\S])*?)\*\*/g,
            "<strong>$1</strong>"
        );
        // Single asterisks for italic
        text = text.replace(/\*((?:(?!\*)[\s\S])*?)\*/g, "<em>$1</em>");

        // Handle strikethrough
        text = text.replace(/~~((?:(?!~~)[\s\S])*?)~~/g, "<del>$1</del>");

        // Handle links
        text = text.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>'
        );

        // Handle lists - improved to catch more patterns
        const processLists = (text) => {
            const lines = text.split("\n");
            const result = [];
            let inList = false;
            let listType = null; // 'ul' or 'ol'

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                // Match various list patterns - improved regex
                const unorderedMatch =
                    line.match(/^[•\-\*\+]\s+(.+)$/) ||
                    (line.match(/^(\d+)\s*\.\s*(.+)$/) &&
                        line.match(/^[•\-\*\+]/));
                const orderedMatch = line.match(/^(\d+)\s*\.\s*(.+)$/);

                if (orderedMatch && !unorderedMatch) {
                    if (!inList || listType !== "ol") {
                        if (inList) {
                            result.push(`</${listType}>`);
                        }
                        result.push('<ol class="markdown-list ordered">');
                        inList = true;
                        listType = "ol";
                    }
                    result.push(
                        `<li class="list-item">${orderedMatch[2]}</li>`
                    );
                } else if (unorderedMatch) {
                    if (!inList || listType !== "ul") {
                        if (inList) {
                            result.push(`</${listType}>`);
                        }
                        result.push('<ul class="markdown-list">');
                        inList = true;
                        listType = "ul";
                    }
                    result.push(
                        `<li class="list-item">${unorderedMatch[1]}</li>`
                    );
                } else {
                    if (inList && line.length === 0) {
                        // Empty line might end the list, but let's be more lenient
                        // Don't immediately close the list on empty lines
                    } else if (
                        inList &&
                        line.length > 0 &&
                        !line.match(/^\s*(\d+\.|\*|\-|\+)/)
                    ) {
                        // Non-list content found, close the list
                        result.push(`</${listType}>`);
                        inList = false;
                        listType = null;
                        result.push(line);
                    } else if (!inList && line.length > 0) {
                        // Regular content, not in a list
                        result.push(line);
                    }
                }
            }

            if (inList) {
                result.push(`</${listType}>`);
            }

            return result.join("\n");
        };

        text = processLists(text);

        // Handle blockquotes
        text = text.replace(
            /(^|\n)> (.+)/g,
            '$1<blockquote class="markdown-quote">$2</blockquote>'
        );

        // Handle horizontal rules
        text = text.replace(/(^|\n)---(\n|$)/g, '$1<hr class="markdown-hr">$2');
        text = text.replace(
            /(^|\n)\*\*\*(\n|$)/g,
            '$1<hr class="markdown-hr">$2'
        );

        // Handle paragraphs - split on double newlines
        const paragraphs = text.split(/\n\s*\n/);
        if (paragraphs.length > 1) {
            text = paragraphs
                .filter((p) => p.trim())
                .map((p) => {
                    // Don't wrap headers, lists, code blocks, etc. in paragraphs
                    if (p.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr)/)) {
                        return p.trim();
                    }
                    return `<p class="markdown-paragraph">${p.trim()}</p>`;
                })
                .join("");
        } else {
            // Single paragraph or no double line breaks
            if (!text.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr)/)) {
                text = `<p class="markdown-paragraph">${text}</p>`;
            }
        }

        // Handle single line breaks within paragraphs (but not in code blocks)
        text = text.replace(/\n(?![^<]*<\/(?:pre|code)>)/g, "<br>");

        // Clean up empty paragraphs
        text = text.replace(/<p class="markdown-paragraph">\s*<\/p>/g, "");

        return text;
    };

    const renderMarkdown = (text) => {
        if (!text) return "";

        // First, improve readability of concatenated text
        text = improveTextFormatting(text);

        // Then apply markdown formatting
        text = applyMarkdownFormatting(text);

        return text;
    };

    // Now use the functions in useMemo
    const renderedContent = useMemo(() => {
        if (!content) return "";
        return renderMarkdown(content);
    }, [content]);

    return (
        <>
            <style jsx>{`
                .markdown-content {
                    line-height: 1.7;
                    color: #374151;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    font-size: 16px;
                }

                .streaming-cursor::after {
                    content: "▊";
                    animation: blink 1s infinite;
                    color: #3b82f6;
                    margin-left: 2px;
                }

                @keyframes blink {
                    0%,
                    50% {
                        opacity: 1;
                    }
                    51%,
                    100% {
                        opacity: 0;
                    }
                }

                .code-block {
                    background-color: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 16px 0;
                    overflow-x: auto;
                    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
                    font-size: 14px;
                    line-height: 1.5;
                    position: relative;
                }

                .code-block::before {
                    content: attr(data-language);
                    position: absolute;
                    top: 8px;
                    right: 12px;
                    font-size: 12px;
                    color: #64748b;
                    text-transform: uppercase;
                    font-weight: 500;
                }

                .code-block code {
                    background: none !important;
                    padding: 0 !important;
                    border-radius: 0 !important;
                    color: #1e293b;
                    font-size: inherit;
                }

                .inline-code {
                    background-color: #f1f5f9;
                    color: #be185d;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
                    font-size: 0.9em;
                    border: 1px solid #e2e8f0;
                }

                .header-1 {
                    font-size: 1.875rem;
                    font-weight: 700;
                    color: #1f2937;
                    margin: 24px 0 16px 0;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 8px;
                    line-height: 1.2;
                }

                .header-2 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 20px 0 12px 0;
                    border-bottom: 1px solid #e5e7eb;
                    padding-bottom: 4px;
                    line-height: 1.3;
                }

                .header-3 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #374151;
                    margin: 16px 0 8px 0;
                    line-height: 1.4;
                }

                .markdown-list {
                    margin: 16px 0;
                    padding-left: 0;
                }

                .markdown-list.ordered {
                    counter-reset: list-counter;
                }

                .list-item {
                    margin: 8px 0;
                    padding-left: 28px;
                    position: relative;
                    list-style: none;
                    line-height: 1.6;
                }

                .markdown-list:not(.ordered) .list-item::before {
                    content: "•";
                    color: #6b7280;
                    font-weight: bold;
                    position: absolute;
                    left: 12px;
                    font-size: 1.1em;
                }

                .markdown-list.ordered .list-item {
                    counter-increment: list-counter;
                }

                .markdown-list.ordered .list-item::before {
                    content: counter(list-counter) ".";
                    color: #6b7280;
                    font-weight: 600;
                    position: absolute;
                    left: 0;
                    width: 24px;
                    text-align: right;
                }

                .markdown-link {
                    color: #2563eb;
                    text-decoration: underline;
                    text-decoration-color: #93c5fd;
                    transition: all 0.2s ease;
                }

                .markdown-link:hover {
                    color: #1d4ed8;
                    text-decoration-color: #2563eb;
                }

                .markdown-quote {
                    border-left: 4px solid #e5e7eb;
                    padding: 12px 16px;
                    margin: 16px 0;
                    font-style: italic;
                    color: #6b7280;
                    background-color: #f9fafb;
                    border-radius: 0 8px 8px 0;
                }

                .markdown-hr {
                    border: none;
                    border-top: 2px solid #e5e7eb;
                    margin: 24px 0;
                }

                .markdown-paragraph {
                    margin: 12px 0;
                    line-height: 1.7;
                }

                .markdown-paragraph:first-child {
                    margin-top: 0;
                }

                .markdown-paragraph:last-child {
                    margin-bottom: 0;
                }

                /* Bold text styling */
                strong {
                    font-weight: 700;
                    color: #1f2937;
                }

                /* Italic text styling */
                em {
                    font-style: italic;
                    color: #374151;
                }

                /* Combined bold and italic */
                strong em,
                em strong {
                    font-weight: 700;
                    font-style: italic;
                    color: #1f2937;
                }
            `}</style>

            <div
                className={`markdown-content ${
                    isStreaming ? "streaming-cursor" : ""
                }`}
                dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
        </>
    );
};

export default MarkdownWrapper;
