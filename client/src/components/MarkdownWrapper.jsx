import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

const MarkdownWrapper = ({ content }) => {
    return (
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
                code: ({ inline, children }) =>
                    inline ? (
                        <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800">
                            {children}
                        </code>
                    ) : (
                        <code className="block bg-gray-100 p-3 rounded-lg text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-x-auto">
                            {children}
                        </code>
                    ),
                pre: ({ children }) => (
                    <pre className="bg-gray-100 p-3 rounded-lg mb-4 overflow-x-auto">
                        {children}
                    </pre>
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
                em: ({ children }) => <em className="italic">{children}</em>,
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
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MarkdownWrapper;
