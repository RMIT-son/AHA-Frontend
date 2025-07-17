import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const MarkdownWrapper = ({ content }) => {
    // Handle empty or null content
    if (!content) return null;

    // Function to handle incomplete markdown gracefully
    const preprocessContent = (rawContent) => {
        let processedContent = rawContent;

        // Ensure there's a newline before numbered list
        processedContent = processedContent.replace(
            /([^\n])(\d\. \*\*)/g,
            "$1\n$2"
        );

        // Optionally fix spacing if missing after colon
        processedContent = processedContent.replace(
            /(:)(\d\. \*\*)/g,
            "$1\n$2"
        );

        // Ensure there's a space after "of" in numbered lists
        processedContent = processedContent.replace(/\bof(\d+)/g, "of $1");

        // Add space after punctuation if missing
        processedContent = processedContent.replace(
            /([a-zA-Z])\.(?=[A-Z])/g,
            "$1. "
        );

        return processedContent;
    };

    const processedContent = preprocessContent(content);

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
                        <h1 className="text-xl font-bold mb-4 text-gray-900">
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-bold mb-3 text-gray-900">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-bold mb-2 text-gray-900">
                            {children}
                        </h3>
                    ),
                    ul: ({ children }) => (
                        <ul className="list-disc list-outside mb-4 space-y-1 pl-6">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="list-decimal list-outside mb-4 space-y-1 pl-6">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed pl-2 text-gray-900">
                            {children}
                        </li>
                    ),
                    code: ({ inline, children, className }) => {
                        // Handle inline code
                        if (inline) {
                            return (
                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
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
                                    <div className="bg-gray-200 px-3 py-1 text-xs font-medium text-gray-600 rounded-t-lg border-b">
                                        {language}
                                    </div>
                                )}
                                <code
                                    className={`block bg-gray-100 p-3 ${
                                        language ? "rounded-b-lg" : "rounded-lg"
                                    } text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto`}
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
                        <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-4 text-gray-700">
                            {children}
                        </blockquote>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic">{children}</em>
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            className="text-blue-600 hover:text-blue-800 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {children}
                        </a>
                    ),
                    hr: () => <hr className="border-gray-200 my-6" />,
                    table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                            <table className="min-w-full border border-gray-200 rounded-lg">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-gray-50">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-gray-200">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-gray-50">{children}</tr>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200 last:border-r-0">
                            {children}
                        </td>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
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
