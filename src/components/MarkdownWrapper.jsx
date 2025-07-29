import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const MarkdownWrapper = ({ content, isStreaming = false }) => {
    // Handle empty or null content
    if (!content) return null;

    let text = content;

    // Fix cases like "of10 bugs:" => "of 10 bugs:"
    text = text.replace(/([a-zA-Z])(\d+)/g, "$1 $2");

    // Handle cases where words are directly concatenated without space
    // Like "asthmaPlease" => "asthma Please"
    text = text.replace(/([a-z])([A-Z][a-z]+)/g, "$1 $2");

    // Fix the specific issue: "**AI Farm Overview**The" should be "**AI Farm Overview**\n\nThe"
    text = text.replace(/(\*\*AI Farm Overview\*\*)The/g, "$1\n\nThe");
    text = text.replace(
        /(\*\*Professional Context \(Image Description\)\*\*)The/g,
        "$1\n\nThe"
    );

    // Handle horizontal rules first to prevent interference
    text = text.replace(/([a-z]):---(\*\*)/g, "$1:\n\n---\n\n$2");
    text = text.replace(/([a-z])\.---(\*\*)/g, "$1.\n\n---\n\n$2");
    text = text.replace(/([a-z])\.---([A-Z])/g, "$1.\n\n---\n\n$2");
    text = text.replace(/---([A-Z])/g, "---\n\n$1");

    // ONLY fix the most critical spacing issues without touching bold syntax
    // Fix components followed by bold headers
    text = text.replace(/([a-z]):(\*\*\d+\.)/g, "$1:\n\n$2");

    // Fix periods followed by bold headers
    text = text.replace(/([a-z])\.(\*\*\d+\.)/g, "$1.\n\n$2");

    // Fix bold headers followed by dashes - but don't touch the bold syntax itself
    text = text.replace(/(\*\*[^*]+\*\*)(-\s)/g, "$1\n\n$2");

    // Convert bullet points to consistent format
    text = text.replace(/^\* /gm, "- ");
    text = text.replace(/\n\* /g, "\n- ");

    // Fix bullet points after periods
    text = text.replace(/([a-z])\.(-\s+[A-Z])/g, "$1.\n$2");

    // Simple numbered list fixes
    text = text.replace(/([a-z:])(\d+\.\s+)/g, "$1\n$2");
    text = text.replace(/([a-z])(\d+\.\s+[A-Z])/g, "$1\n$2");
    text = text.replace(/(\d+\.\s+[^0-9\n]+?)(?=\d+\.)/g, "$1\n");
    text = text.replace(
        /(\d+\.\s+[^0-9]+?)\s+(Please|Let\s+me|Remember|Note|Important|Also)\s+/gi,
        "$1\n\n$2 "
    );
    text = text.replace(/(\d+\.)([A-Z])/g, "$1 $2");

    // Clean up excessive newlines
    text = text.replace(/\n{4,}/g, "\n\n");
    text = text.trim();

    const processedContent = text;

    return (
        <div className="markdown-content">
            <ReactMarkdown
                rehypePlugins={[rehypeSanitize]}
                components={{
                    p: ({ children }) => (
                        <p className="mb-4 last:mb-0 leading-relaxed text-gray-900">
                            {children}
                        </p>
                    ),
                    h1: ({ children }) => (
                        <h1 className="text-2xl font-bold mb-6 text-gray-900 border-b border-gray-200 pb-2">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl font-bold mb-4 text-gray-900">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg font-bold mb-3 text-gray-900">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-bold mb-2 text-gray-900">
                            {children}
                        </h4>
                    ),
                    h5: ({ children }) => (
                        <h5 className="text-sm font-bold mb-2 text-gray-900">
                            {children}
                        </h5>
                    ),
                    h6: ({ children }) => (
                        <h6 className="text-sm font-bold mb-2 text-gray-600">
                            {children}
                        </h6>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-outside mb-4 space-y-2 pl-6">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-outside mb-4 space-y-2 pl-6">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed pl-1 text-gray-900">
                            {children}
                        </li>
                    ),
                    code: ({ inline, children, className }) => {
                        // Handle inline code
                        if (inline) {
                            return (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 border">
                                    {children}
                                </code>
                            );
                        }

                        // Handle code blocks
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";

                        return (
                            <div className="relative mb-4">
                                {language && (
                                    <div className="bg-gray-700 text-gray-200 px-3 py-2 text-xs font-medium rounded-t-lg border-b border-gray-600">
                                        {language}
                                    </div>
                                )}
                                <code
                                    className={`block bg-gray-900 text-gray-100 p-4 ${
                                        language ? "rounded-b-lg" : "rounded-lg"
                                    } text-sm font-mono whitespace-pre-wrap overflow-x-auto border border-gray-600`}
                                >
                                    {children}
                                </code>
                            </div>
                        );
                    },
                    pre: ({ children }) => (
                        <div className="mb-4">{children}</div>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-400 pl-4 italic mb-4 text-gray-700 bg-blue-50 py-2 rounded-r">
                            {children}
                        </blockquote>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-gray-900">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-gray-800">{children}</em>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-blue-600 hover:text-blue-800 underline hover:no-underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => <hr className="border-gray-300 my-8" />,
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4 border border-gray-200 rounded-lg">
                            <table className="min-w-full">{children}</table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50 transition-colors">
                            {children}
                        </tr>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200 last:border-r-0">
                            {children}
                        </td>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                            {children}
                        </th>
                    ),
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownWrapper;
